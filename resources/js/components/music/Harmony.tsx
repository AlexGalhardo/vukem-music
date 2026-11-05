import { useCallback, useEffect, useRef, useState } from "react";
import topics from "../../data/harmony.json";
import { useI18n } from "../../lib/i18n";
import { PianoAudio } from "../../music/audio";
import { type ChordQuality, chordPitches, qualities, rootSteps } from "../../music/harmony";
import { diatonic, pitchName, toMidi } from "../../music/theory";
import type { Pitch } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Piano } from "./Piano";

function ChordStaff({ pitches, label }: { pitches: Pitch[]; label: string }) {
  const y = (pitch: Pitch) => 112 - (diatonic(pitch) - 30) * 6;
  const top = Math.min(0, Math.min(...pitches.map(y)) - 40);
  const ledgerLines = new Set<number>();
  for (const pitch of pitches) {
    const position = diatonic(pitch) - 30;
    for (let p = -2; p >= position; p -= 2) ledgerLines.add(112 - p * 6);
    for (let p = 10; p <= position; p += 2) ledgerLines.add(112 - p * 6);
  }
  return (
    <svg
      viewBox={`0 ${top} 320 ${170 - top}`}
      role="img"
      aria-label={label}
      className="h-44 w-full max-w-sm text-foreground"
    >
      <title>{label}</title>
      {[0, 1, 2, 3, 4].map((line) => (
        <line
          key={line}
          x1="24"
          x2="300"
          y1={64 + line * 12}
          y2={64 + line * 12}
          stroke="currentColor"
          opacity="0.45"
        />
      ))}
      <text x="35" y="110" fontSize="66" fill="currentColor">
        𝄞
      </text>
      {[...ledgerLines].map((line) => (
        <line key={line} x1="159" x2="188" y1={line} y2={line} stroke="currentColor" />
      ))}
      <line
        x1="183"
        x2="183"
        y1={Math.min(...pitches.map(y)) - 32}
        y2={Math.max(...pitches.map(y))}
        stroke="currentColor"
      />
      {pitches.map((pitch, index) => (
        <g key={`${pitch.step}${pitch.octave}`}>
          {pitch.alter !== 0 && (
            <text x={145 - index * 13} y={y(pitch) + 5} fontSize="20" fill="currentColor">
              {pitch.alter === -2 ? "𝄫" : pitch.alter === -1 ? "♭" : pitch.alter === 2 ? "𝄪" : "♯"}
            </text>
          )}
          <ellipse cx="174" cy={y(pitch)} rx="9" ry="6" transform={`rotate(-18 174 ${y(pitch)})`} fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

export function Harmony() {
  const { t, local, locale } = useI18n();
  const [root, setRoot] = useState<Pitch["step"]>("C");
  const [quality, setQuality] = useState<ChordQuality>("major");
  const [inversion, setInversion] = useState(0);
  const [active, setActive] = useState<number[]>([]);
  const [mode, setMode] = useState("ui.synth");
  const [error, setError] = useState(false);
  const audio = useRef<PianoAudio | null>(null);
  const epoch = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pitches = chordPitches({ step: root, octave: 4, alter: 0 }, quality, inversion);
  const stop = useCallback(() => {
    epoch.current++;
    clearTimeout(timer.current);
    audio.current?.stopAll();
    setActive([]);
  }, []);
  useEffect(() => {
    const cancel = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", cancel);
    window.addEventListener("blur", stop);
    return () => {
      document.removeEventListener("visibilitychange", cancel);
      window.removeEventListener("blur", stop);
      stop();
      audio.current?.close();
    };
  }, [stop]);
  const prepare = useCallback(async () => {
    const engine = audio.current ?? new PianoAudio();
    audio.current = engine;
    await engine.prepare();
    return engine;
  }, []);
  const onNote = useCallback(
    async (midi: number) => {
      const token = epoch.current;
      try {
        const engine = await prepare();
        if (token !== epoch.current) return () => {};
        setMode(engine.mode === "samples" ? "ui.samples" : "ui.synth");
        return engine.play(midi, engine.context?.currentTime ?? 0, 2);
      } catch {
        setError(true);
        return () => {};
      }
    },
    [prepare],
  );
  const play = async () => {
    stop();
    const token = epoch.current;
    setError(false);
    try {
      const engine = await prepare();
      if (token !== epoch.current || !engine.context) return;
      const notes = pitches.map(toMidi);
      const at = engine.context.currentTime;
      for (const midi of notes) engine.play(midi, at, 1.5, 1 / notes.length);
      setMode(engine.mode === "samples" ? "ui.samples" : "ui.synth");
      setActive(notes);
      timer.current = setTimeout(() => setActive([]), 1600);
    } catch {
      if (token === epoch.current) setError(true);
    }
  };
  return (
    <section className="space-y-8">
      <header>
        <p className="eyebrow mb-3">{t("nav.harmony")}</p>
        <h1 className="section-title text-4xl">{t("ui.harmonyTitle")}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{t("ui.harmonyBody")}</p>
      </header>
      <Card className="gap-5 p-5 shadow-none md:p-7">
        <div className="grid gap-4 sm:flex sm:flex-wrap">
          <label htmlFor="chord-root" className="grid gap-2 text-sm">
            {t("ui.chordRoot")}
            <select
              id="chord-root"
              value={root}
              onChange={(e) => {
                stop();
                setRoot(e.target.value as Pitch["step"]);
              }}
              className="rounded-lg border bg-card px-3 py-2"
            >
              {rootSteps.map((step) => (
                <option key={step} value={step}>
                  {pitchName({ step, octave: 4, alter: 0 }, locale).replace("4", "")}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="chord-quality" className="grid gap-2 text-sm">
            {t("ui.chordQuality")}
            <select
              id="chord-quality"
              value={quality}
              onChange={(e) => {
                stop();
                setQuality(e.target.value as ChordQuality);
                setInversion(0);
              }}
              className="rounded-lg border bg-card px-3 py-2"
            >
              {Object.keys(qualities).map((key) => (
                <option key={key} value={key}>
                  {t(`ui.${key}`)}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="chord-inversion" className="grid gap-2 text-sm">
            {t("ui.chordInversion")}
            <select
              id="chord-inversion"
              value={inversion}
              onChange={(e) => {
                stop();
                setInversion(Number(e.target.value));
              }}
              className="rounded-lg border bg-card px-3 py-2"
            >
              {qualities[quality].map((interval, i) => (
                <option key={interval} value={i}>
                  {t(`ui.inversion${i}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <ChordStaff
            pitches={pitches}
            label={`${t("ui.chordStaff")}: ${pitches.map((pitch) => pitchName(pitch, locale)).join(" – ")}`}
          />
          <div className="space-y-3">
            <p data-testid="chord-notes" className="text-xl font-semibold">
              {pitches.map((pitch) => pitchName(pitch, locale)).join(" – ")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("ui.chordRoot")}: {pitchName({ step: root, octave: 4, alter: 0 }, locale)} · {t("ui.chordBass")}:{" "}
              {pitchName(pitches[0], locale)}
            </p>
            <div className="flex gap-3">
              <Button onClick={() => void play()}>{t("ui.playChord")}</Button>
              <Button variant="outline" onClick={stop}>
                {t("ui.stop")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t(mode)}</p>
            {error && (
              <p role="alert" className="text-sm">
                {t("ui.audioError")}
              </p>
            )}
          </div>
        </div>
        <Piano activeMidi={active[0]} activeMidis={active} onNote={onNote} />
        <p className="text-xs leading-6 text-muted-foreground">{t("ui.harmonyNote")}</p>
      </Card>
      <h2 className="section-title text-2xl">{t("ui.harmonyPath")}</h2>
      <div className="grid gap-5 xl:grid-cols-2">
        {topics.map((topic, index) => (
          <Card key={topic.id} className="gap-4 p-6 shadow-none">
            <Badge variant="secondary">
              {String(index + 1).padStart(2, "0")} · {local(topic.level)}
            </Badge>
            <h3 className="text-xl font-semibold">{local(topic.title)}</h3>
            <p className="text-sm leading-7 text-muted-foreground">{local(topic.body)}</p>
            <div className="rounded-lg bg-muted p-4 text-sm leading-7">
              <strong>{t("ui.workedExample")}</strong>
              <p>{local(topic.example)}</p>
            </div>
            <p className="text-sm leading-7">
              <strong>{t("ui.learningTask")}: </strong>
              {local(topic.task)}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
