import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PianoAudio } from "./audio";
import { type MusicDocument, performance } from "./musicxml";
import { type Tuning, tunedFrequency } from "./tuning";

export function usePerformance(document: MusicDocument, bpm: number, transpose: number, tuning: Tuning) {
  const compiled = useMemo(() => {
    try {
      return { score: performance(document, bpm, transpose), invalid: false };
    } catch {
      return {
        score: { events: [], total: 0, order: [], segments: [] } as ReturnType<typeof performance>,
        invalid: true,
      };
    }
  }, [document, bpm, transpose]);
  const score = compiled.score;
  const audio = useRef<PianoAudio | null>(null);
  const epoch = useRef(0);
  const raf = useRef(0);
  const offset = useRef(0);
  const anchor = useRef(0);
  const running = useRef(false);
  const [position, setPosition] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [error, setError] = useState(false);
  const [mode, setMode] = useState("synth");
  const stop = useCallback(() => {
    epoch.current++;
    running.current = false;
    cancelAnimationFrame(raf.current);
    audio.current?.stopAll();
    offset.current = 0;
    setPosition(0);
    setStatus("idle");
  }, []);
  const pause = useCallback(() => {
    if (!running.current) return;
    offset.current = Math.min(score.total, Math.max(0, (audio.current?.context?.currentTime ?? 0) - anchor.current));
    epoch.current++;
    running.current = false;
    cancelAnimationFrame(raf.current);
    audio.current?.stopAll();
    setPosition(offset.current);
    setStatus("paused");
  }, [score.total]);
  useEffect(() => {
    void score;
    void tuning;
    stop();
    const hide = () => {
      if (documentThis.hidden) pause();
    };
    const documentThis = globalThis.document;
    documentThis.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", pause);
    return () => {
      epoch.current++;
      running.current = false;
      cancelAnimationFrame(raf.current);
      audio.current?.stopAll();
      documentThis.removeEventListener("visibilitychange", hide);
      window.removeEventListener("blur", pause);
    };
  }, [score, tuning, stop, pause]);
  useEffect(
    () => () => {
      audio.current?.close();
      audio.current = null;
    },
    [],
  );
  const play = async () => {
    if (compiled.invalid) {
      setError(true);
      return;
    }
    const token = ++epoch.current;
    setStatus("loading");
    setError(false);
    try {
      const engine = audio.current ?? new PianoAudio();
      audio.current = engine;
      await engine.prepare();
      if (token !== epoch.current || !engine.context) return;
      engine.stopAll();
      setMode(engine.mode);
      const context = engine.context;
      const start = offset.current >= score.total ? 0 : offset.current;
      anchor.current = context.currentTime + 0.04 - start;
      const pending = score.events.filter((e) => e.end > start);
      let next = 0;
      running.current = true;
      setStatus("playing");
      const tick = () => {
        if (token !== epoch.current || !running.current) return;
        const now = Math.max(0, context.currentTime - anchor.current);
        while (next < pending.length && pending[next].start < now + 0.15) {
          const event = pending[next++];
          if (event.end <= now) continue;
          const at = Math.max(now, event.start);
          const simultaneous = score.events.filter((e) => e.start <= at + 1e-7 && e.end > at).length;
          if (simultaneous > 32) {
            setError(true);
            stop();
            return;
          }
          engine.play(
            event.midi,
            anchor.current + at,
            event.end - at,
            event.velocity / Math.max(1, simultaneous),
            tunedFrequency(event.midi, tuning),
          );
        }
        setPosition(Math.min(now, score.total));
        if (now >= score.total) {
          running.current = false;
          offset.current = 0;
          setStatus("idle");
          return;
        }
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    } catch {
      if (token === epoch.current) {
        setError(true);
        setStatus("idle");
      }
    }
  };
  const manual = useCallback(
    async (midi: number) => {
      const token = epoch.current;
      const engine = audio.current ?? new PianoAudio();
      audio.current = engine;
      try {
        await engine.prepare();
        if (token !== epoch.current || !engine.context) return () => {};
        return engine.play(midi, engine.context.currentTime, 2, 0.7, tunedFrequency(midi, tuning));
      } catch {
        setError(true);
        return () => {};
      }
    },
    [tuning],
  );
  const active = status === "playing" ? score.events.filter((e) => position >= e.start && position < e.end) : [];
  const segment = score.segments.find((s) => position >= s.start && position < s.end);
  const sourceBeat = segment ? segment.sourceBeat + ((position - segment.start) * bpm) / 60 : 0;
  return {
    position,
    status,
    error: error || compiled.invalid,
    mode,
    play,
    pause,
    stop,
    manual,
    active,
    sourceBeat,
    total: score.total,
  };
}
