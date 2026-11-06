import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "../../lib/i18n";
import { PianoAudio } from "../../music/audio";
import { type Detection, decodeMidi, detectPitch } from "../../music/instruments";
import { pitchAt, pitchName } from "../../music/theory";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Piano } from "./Piano";

export function Instruments() {
  const { t, locale } = useI18n();
  const [active, setActive] = useState<number[]>([]);
  const [midiConnected, setMidiConnected] = useState(false);
  const [device, setDevice] = useState("");
  const [mic, setMic] = useState(false);
  const [detection, setDetection] = useState<Detection | null>(null);
  const [error, setError] = useState("");
  const engine = useRef<PianoAudio | null>(null);
  const access = useRef<MIDIAccess | null>(null);
  const voices = useRef(new Map<string, { note: number; stop: () => void; released: boolean }>());
  const pedals = useRef(new Set<string>());
  const generation = useRef(0);
  const focused = useRef(true);
  const micGeneration = useRef(0);
  const stream = useRef<MediaStream | null>(null);
  const context = useRef<AudioContext | null>(null);
  const frame = useRef(0);
  const refresh = useCallback(() => setActive([...new Set([...voices.current.values()].map((v) => v.note))]), []);
  const reset = useCallback(() => {
    generation.current++;
    for (const voice of voices.current.values()) voice.stop();
    voices.current.clear();
    pedals.current.clear();
    engine.current?.stopAll();
    setActive([]);
  }, []);
  const stopMic = useCallback(() => {
    micGeneration.current++;
    cancelAnimationFrame(frame.current);
    for (const track of stream.current?.getTracks() ?? []) track.stop();
    stream.current = null;
    void context.current?.close();
    context.current = null;
    setMic(false);
    setDetection(null);
  }, []);
  const detach = useCallback(() => {
    reset();
    if (access.current) {
      for (const input of access.current.inputs.values()) {
        input.onmidimessage = null;
        void input.close();
      }
      access.current.onstatechange = null;
      access.current = null;
    }
    setMidiConnected(false);
    setDevice("");
  }, [reset]);
  const manual = useCallback(async (note: number) => {
    const token = generation.current;
    const audio = engine.current ?? new PianoAudio();
    engine.current = audio;
    try {
      await audio.prepare();
      if (token !== generation.current || !audio.context) return () => {};
      return audio.play(note, audio.context.currentTime, 8, 0.5);
    } catch {
      setError("ui.audioError");
      return () => {};
    }
  }, []);
  const connect = async () => {
    if (!navigator.requestMIDIAccess) {
      setError("ui.midiUnavailable");
      return;
    }
    const token = generation.current;
    setError("");
    try {
      const midi = await navigator.requestMIDIAccess({ sysex: false });
      if (token !== generation.current) return;
      access.current = midi;
      const bind = () => {
        reset();
        const names: string[] = [];
        for (const input of midi.inputs.values()) {
          if (input.state !== "connected") {
            input.onmidimessage = null;
            continue;
          }
          names.push(input.name ?? input.id);
          input.onmidimessage = (message) => {
            if (document.hidden || !focused.current) return;
            if (!message.data) return;
            const action = decodeMidi(message.data);
            if (!action) return;
            const key = `${input.id}:${action.channel}:${action.note}`;
            const pedalKey = `${input.id}:${action.channel}`;
            if (action.type === "reset") {
              reset();
              return;
            }
            if (action.type === "pedal") {
              if (action.down) pedals.current.add(pedalKey);
              else {
                pedals.current.delete(pedalKey);
                for (const [id, voice] of voices.current)
                  if (id.startsWith(`${input.id}:${action.channel}:`) && voice.released) {
                    voice.stop();
                    voices.current.delete(id);
                  }
                refresh();
              }
              return;
            }
            if (action.type === "off") {
              const voice = voices.current.get(key);
              if (voice) {
                if (pedals.current.has(pedalKey)) voice.released = true;
                else {
                  voice.stop();
                  voices.current.delete(key);
                }
                refresh();
              }
              return;
            }
            voices.current.get(key)?.stop();
            voices.current.delete(key);
            if (voices.current.size >= 32) {
              const oldest = voices.current.keys().next().value;
              if (oldest !== undefined) {
                voices.current.get(oldest)?.stop();
                voices.current.delete(oldest);
              }
            }
            const audio = engine.current;
            const voice = { note: action.note, stop: () => {}, released: false };
            voices.current.set(key, voice);
            refresh();
            const start = async () => {
              const a = audio ?? new PianoAudio();
              engine.current = a;
              await a.prepare();
              if (voices.current.get(key) !== voice || !a.context) return;
              voice.stop = a.play(action.note, a.context.currentTime, 30, action.velocity * 0.35);
            };
            void start().catch(() => setError("ui.audioError"));
          };
        }
        setDevice(names.join(", "));
        setMidiConnected(true);
      };
      // Unlock audio during the user's explicit connection gesture.
      const audio = engine.current ?? new PianoAudio();
      engine.current = audio;
      await audio.prepare();
      if (token !== generation.current) {
        detach();
        return;
      }
      bind();
      midi.onstatechange = bind;
    } catch {
      setError("ui.midiError");
      detach();
    }
  };
  const startMic = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("ui.micUnavailable");
      return;
    }
    const token = micGeneration.current;
    setError("");
    try {
      const capture = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (token !== micGeneration.current) {
        for (const track of capture.getTracks()) track.stop();
        return;
      }
      stream.current = capture;
      const audio = new AudioContext();
      context.current = audio;
      await audio.resume();
      if (token !== micGeneration.current) {
        stopMic();
        return;
      }
      const analyser = audio.createAnalyser();
      analyser.fftSize = 4096;
      audio.createMediaStreamSource(capture).connect(analyser);
      const data = new Float32Array(analyser.fftSize);
      let last = 0;
      let stable = 0;
      let previous = -1;
      setMic(true);
      const tick = (time: number) => {
        if (token !== micGeneration.current) return;
        if (time - last > 120) {
          last = time;
          analyser.getFloatTimeDomainData(data);
          const estimate = detectPitch(data, audio.sampleRate);
          if (estimate && estimate.confidence > 0.94 && Math.abs(estimate.cents) < 35) {
            stable = estimate.midi === previous ? stable + 1 : 1;
            previous = estimate.midi;
            setDetection(stable >= 3 ? estimate : null);
          } else {
            stable = 0;
            previous = -1;
            setDetection(null);
          }
        }
        frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    } catch {
      stopMic();
      setError("ui.micError");
    }
  };
  useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        reset();
        stopMic();
      }
    };
    const focus = () => {
      focused.current = true;
    };
    const blur = () => {
      focused.current = false;
      reset();
      stopMic();
    };
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
      detach();
      stopMic();
      engine.current?.close();
    };
  }, [reset, stopMic, detach]);
  return (
    <section className="space-y-7">
      <header>
        <p className="eyebrow mb-3">{t("nav.instruments")}</p>
        <h1 className="section-title text-4xl">{t("ui.instrumentTitle")}</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{t("ui.instrumentBody")}</p>
      </header>
      <Card className="gap-4 p-5 shadow-none">
        <h2 className="text-xl font-semibold">MIDI</h2>
        <p className="text-sm leading-7 text-muted-foreground">{t("ui.midiBody")}</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void connect()} disabled={midiConnected}>
            {t("ui.connectMidi")}
          </Button>
          <Button variant="outline" onClick={detach}>
            {t("ui.disconnect")}
          </Button>
          <Button variant="ghost" onClick={reset}>
            {t("ui.allNotesOff")}
          </Button>
        </div>
        <p role="status" className="text-sm">
          {device || (midiConnected ? t("ui.noMidiDevice") : t("ui.notConnected"))}
        </p>
        <Piano activeMidi={active[0]} activeMidis={active} onNote={manual} />
      </Card>
      <Card className="gap-4 p-5 shadow-none">
        <h2 className="text-xl font-semibold">{t("ui.microphone")}</h2>
        <p className="text-sm leading-7 text-muted-foreground">{t("ui.micBody")}</p>
        <div className="flex gap-3">
          <Button onClick={() => void startMic()} disabled={mic}>
            {t("ui.startMic")}
          </Button>
          <Button variant="outline" onClick={stopMic}>
            {t("ui.stopMic")}
          </Button>
        </div>
        <output aria-live="polite" className="text-lg font-semibold">
          {detection
            ? `${pitchName(pitchAt(detection.midi), locale)} · ${detection.frequency.toFixed(1)} Hz · ${detection.cents.toFixed(0)} cents`
            : t(mic ? "ui.listeningPitch" : "ui.micOff")}
        </output>
        <p className="text-xs leading-6 text-muted-foreground">{t("ui.micCaution")}</p>
      </Card>
      {error && (
        <p role="alert" className="text-sm">
          {t(error)}
        </p>
      )}
    </section>
  );
}
