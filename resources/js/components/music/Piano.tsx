import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "../../lib/i18n";
import { isBlack, pianoKeys, pitchAt, pitchName } from "../../music/theory";
import { Button } from "../ui/button";

const keyboard = "awsedftgyhujk";
export function Piano({
  activeMidi,
  activeMidis = [],
  onNote,
  onAnswer,
}: {
  activeMidi?: number;
  activeMidis?: number[];
  onNote: (midi: number) => Promise<() => void>;
  onAnswer?: (midi: number) => void;
}) {
  const { t, locale } = useI18n();
  const [pressed, setPressed] = useState<number[]>([]);
  const [focused, setFocused] = useState(60);
  const svg = useRef<SVGSVGElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const voices = useRef(new Map<number, (() => void) | null>());
  const release = useCallback((midi: number) => {
    voices.current.get(midi)?.();
    voices.current.delete(midi);
    setPressed((keys) => keys.filter((key) => key !== midi));
  }, []);
  const releaseAll = useCallback(() => {
    for (const stop of voices.current.values()) stop?.();
    voices.current.clear();
    setPressed([]);
  }, []);
  const press = useCallback(
    (midi: number) => {
      if (voices.current.has(midi)) return;
      voices.current.set(midi, null);
      setPressed((keys) => [...keys, midi]);
      onAnswer?.(midi);
      void onNote(midi).then((stop) => {
        if (voices.current.has(midi)) voices.current.set(midi, stop);
        else stop();
      });
    },
    [onNote, onAnswer],
  );
  const scrollToKey = useCallback((midi: number, force = false) => {
    const key = svg.current?.querySelector(`[data-piano-midi="${midi}"]`);
    const container = scroller.current;
    if (!key || !container) return;
    const rect = key.getBoundingClientRect();
    const bounds = container.getBoundingClientRect();
    if (force || rect.left < bounds.left + 10 || rect.right > bounds.right - 10) {
      container.scrollLeft += rect.left - bounds.left - (container.clientWidth - rect.width) / 2;
    }
  }, []);
  const center = useCallback(() => scrollToKey(60, true), [scrollToKey]);
  useEffect(() => {
    if (activeMidi !== undefined) scrollToKey(activeMidi);
  }, [activeMidi, scrollToKey]);
  useEffect(() => {
    center();
  }, [center]);
  useEffect(() => {
    const excluded = (target: EventTarget | null) =>
      target instanceof HTMLElement && target.closest("input,select,textarea,button,a,[contenteditable=true]") !== null;
    const down = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey || excluded(event.target)) return;
      const index = keyboard.indexOf(event.key.toLowerCase());
      if (event.key.length === 1 && index >= 0) {
        event.preventDefault();
        if (!event.repeat) press(60 + index);
      }
    };
    const up = (event: KeyboardEvent) => {
      const i = keyboard.indexOf(event.key.toLowerCase());
      if (event.key.length === 1 && i >= 0) release(60 + i);
    };
    const hide = () => {
      if (document.hidden) releaseAll();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", releaseAll);
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", releaseAll);
      document.removeEventListener("visibilitychange", hide);
      releaseAll();
    };
  }, [press, release, releaseAll]);
  let white = 0;
  const geometry = pianoKeys.map((midi) => {
    const black = isBlack(midi);
    const x = black ? white * 26 - 8 : white++ * 26;
    return { midi, black, x };
  });
  const render = ({ midi, black, x }: (typeof geometry)[number]) => {
    const name = pitchName(pitchAt(midi), locale);
    const active = activeMidi === midi || activeMidis.includes(midi) || pressed.includes(midi);
    return (
      // biome-ignore lint/a11y/useSemanticElements: Native HTML buttons cannot be children of an SVG piano.
      <g
        key={midi}
        data-piano-midi={midi}
        data-active={active}
        className={`piano-key ${black ? "black-key" : "white-key"} ${active ? "active" : ""}`}
        role="button"
        aria-label={name}
        aria-pressed={active}
        tabIndex={focused === midi ? 0 : -1}
        onFocus={() => setFocused(midi)}
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.focus();
          press(midi);
        }}
        onPointerUp={() => release(midi)}
        onPointerCancel={() => release(midi)}
        onLostPointerCapture={() => release(midi)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!event.repeat) press(midi);
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            const target = Math.min(108, Math.max(21, midi + (event.key === "ArrowRight" ? 1 : -1)));
            svg.current?.querySelector<SVGGElement>(`[data-piano-midi="${target}"]`)?.focus();
          }
        }}
        onKeyUp={(event) => {
          if (event.key === "Enter" || event.key === " ") release(midi);
        }}
        onBlur={() => release(midi)}
      >
        <title>{name}</title>
        <rect x={x} y="0" width={black ? 16 : 25} height={black ? 94 : 148} rx={black ? 3 : 4} />
        {!black && (midi % 12 === 0 || active) && (
          <text x={x + 12.5} y="133" textAnchor="middle">
            {name}
          </text>
        )}
      </g>
    );
  };
  return (
    <section className="space-y-3" aria-label={t("ui.piano")}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">A0 — C8 · 88</span>
        <Button type="button" size="sm" variant="ghost" onClick={center}>
          {t("ui.middleC")}
        </Button>
      </div>
      <div ref={scroller} className="piano-scroll overflow-x-auto rounded-lg border bg-zinc-900 p-2">
        {/* biome-ignore lint/a11y/useSemanticElements: An SVG piano groups interactive SVG keys. */}
        <svg
          ref={svg}
          width={white * 26}
          height="151"
          viewBox={`0 0 ${white * 26} 151`}
          role="group"
          aria-label={t("ui.piano")}
          className="max-w-none touch-pan-x"
        >
          {geometry.filter((key) => !key.black).map(render)}
          {geometry.filter((key) => key.black).map(render)}
        </svg>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{t("ui.pianoHint")}</p>
    </section>
  );
}
