import { useCallback, useEffect, useRef, useState } from "react";
import type { Score } from "../types";
import { PianoAudio } from "./audio";
import { activeAt, remaining, timeline, toMidi } from "./theory";

export function useTransport(score: Score, bpm: number) {
  const engine = useRef<PianoAudio | null>(null);
  const session = useRef(0);
  const frame = useRef(0);
  const offset = useRef(0);
  const anchor = useRef(0);
  const running = useRef(false);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [position, setPosition] = useState(0);
  const [mode, setMode] = useState<"synth" | "samples">("synth");
  const [error, setError] = useState<string | null>(null);
  const events = timeline(score, bpm);
  const total = events.at(-1)?.end ?? 0;

  const stop = useCallback(() => {
    session.current++;
    running.current = false;
    cancelAnimationFrame(frame.current);
    engine.current?.stopAll();
    offset.current = 0;
    setPosition(0);
    setStatus("idle");
  }, []);

  const pause = useCallback(() => {
    if (!running.current) return;
    offset.current = Math.max(0, (engine.current?.context?.currentTime ?? 0) - anchor.current);
    running.current = false;
    session.current++;
    cancelAnimationFrame(frame.current);
    engine.current?.stopAll();
    setPosition(offset.current);
    setStatus("paused");
  }, []);

  useEffect(() => {
    // A new score/tempo always starts a fresh musical timeline.
    void score;
    void bpm;
    stop();
    const hide = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      session.current++;
      running.current = false;
      cancelAnimationFrame(frame.current);
      engine.current?.stopAll();
      document.removeEventListener("visibilitychange", hide);
    };
  }, [score, bpm, pause, stop]);

  useEffect(
    () => () => {
      engine.current?.close();
      engine.current = null;
    },
    [],
  );

  const play = async () => {
    const token = ++session.current;
    setError(null);
    setStatus("loading");
    try {
      if (!engine.current) engine.current = new PianoAudio();
      await engine.current.prepare();
      if (token !== session.current) return;
      const audio = engine.current;
      const context = audio.context;
      if (!context) throw new Error("Audio unavailable");
      audio.stopAll();
      setMode(audio.mode);
      if (audio.sampleError) setError("ui.audioFallback");
      const start = offset.current >= total ? 0 : offset.current;
      anchor.current = context.currentTime + 0.04 - start;
      for (const item of remaining(events, start)) {
        if (item.event.pitch) audio.play(toMidi(item.event.pitch), anchor.current + item.start, item.end - item.start);
      }
      running.current = true;
      setStatus("playing");
      const tick = () => {
        if (token !== session.current || !running.current) return;
        const now = Math.max(0, context.currentTime - anchor.current);
        setPosition(Math.min(now, total));
        if (now >= total) {
          offset.current = 0;
          running.current = false;
          setStatus("idle");
          return;
        }
        frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    } catch {
      if (token === session.current) {
        setStatus("idle");
        setError(typeof AudioContext === "undefined" ? "ui.noAudio" : "ui.audioError");
      }
    }
  };

  const manual = useCallback(async (midi: number): Promise<() => void> => {
    const token = session.current;
    try {
      if (!engine.current) engine.current = new PianoAudio();
      await engine.current.prepare();
      if (token !== session.current || !engine.current.context) return () => {};
      return engine.current.play(midi, engine.current.context.currentTime, 1.2);
    } catch {
      setError("ui.audioError");
      return () => {};
    }
  }, []);

  return {
    status,
    position,
    total,
    mode,
    error,
    play,
    pause,
    stop,
    manual,
    active: status === "playing" ? activeAt(events, position)?.event : undefined,
  };
}
