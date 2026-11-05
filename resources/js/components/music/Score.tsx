import { useEffect, useId, useRef } from "react";
import { useI18n } from "../../lib/i18n";
import { diatonic, pitchName, quarterBeats, toMidi } from "../../music/theory";
import type { Score as ScoreData } from "../../types";

export function Score({ score, activeId }: { score: ScoreData; activeId?: string }) {
  const { t, locale } = useI18n();
  const titleId = useId();
  const scroller = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!activeId || !scroller.current) return;
    const container = scroller.current;
    const note = container.querySelector(`[data-event-id="${CSS.escape(activeId)}"]`);
    if (!note) return;
    const rect = note.getBoundingClientRect();
    const bounds = container.getBoundingClientRect();
    if (rect.left < bounds.left + 20 || rect.right > bounds.right - 20) {
      container.scrollLeft += rect.left - bounds.left - container.clientWidth / 2;
    }
  }, [activeId]);
  const beatsPerBar = (score.meter[0] * 4) / score.meter[1];
  const beats = score.events.reduce((sum, event) => sum + quarterBeats(event.duration), 0);
  const bars = Math.max(1, Math.ceil(beats / beatsPerBar));
  const barWidth = 278;
  const width = 120 + bars * barWidth + 24;
  const bottomPitch = score.clef === "treble" ? 4 * 7 + 2 : 2 * 7 + 4;
  let elapsed = 0;
  return (
    <section
      ref={scroller}
      className="score-scroll overflow-x-auto rounded-xl border bg-card"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: The scroll region must be keyboard reachable.
      tabIndex={0}
      aria-label={t("ui.score")}
    >
      <svg
        viewBox={`0 0 ${width} 190`}
        className="score-svg h-48 w-full"
        style={{ minWidth: Math.min(width, 670) }}
        role="img"
        aria-labelledby={titleId}
      >
        <title id={titleId}>
          {t("ui.score")}:{" "}
          {score.events.map((event) => (event.pitch ? pitchName(event.pitch, locale) : t("ui.rest"))).join(", ")}
        </title>
        {[0, 1, 2, 3, 4].map((line) => (
          <line key={line} x1="20" x2={width - 20} y1={55 + line * 12} y2={55 + line * 12} className="staff-line" />
        ))}
        <text
          x="26"
          y={score.clef === "treble" ? 108 : 94}
          className="clef"
          fontSize={score.clef === "treble" ? 72 : 56}
        >
          {score.clef === "treble" ? "𝄞" : "𝄢"}
        </text>
        <text x="88" y="75" className="time-signature" textAnchor="middle">
          {score.meter[0]}
        </text>
        <text x="88" y="100" className="time-signature" textAnchor="middle">
          {score.meter[1]}
        </text>
        {Array.from({ length: bars }, (_, i) => i + 1).map((bar) => (
          <line key={bar} x1={120 + bar * barWidth} x2={120 + bar * barWidth} y1="55" y2="103" className="staff-line" />
        ))}
        {score.events.map((event) => {
          const x = 145 + (elapsed / beatsPerBar) * barWidth;
          const currentMeasure = Math.floor(elapsed / beatsPerBar) + 1;
          elapsed += quarterBeats(event.duration);
          const stepsFromBottom = event.pitch ? diatonic(event.pitch) - bottomPitch : 4;
          const y = 103 - stepsFromBottom * 6;
          const duration = quarterBeats(event.duration);
          const active = activeId === event.id;
          const up = stepsFromBottom < 4;
          const stemX = x + (up ? 6.8 : -6.8);
          const stemEnd = y + (up ? -34 : 34);
          const ledger: number[] = [];
          for (let step = -2; step >= stepsFromBottom; step -= 2) ledger.push(step);
          for (let step = 10; step <= stepsFromBottom; step += 2) ledger.push(step);
          return (
            <g
              key={event.id}
              data-event-id={event.id}
              data-midi={event.pitch ? toMidi(event.pitch) : "rest"}
              data-active={active}
              className={`score-event ${active ? "active" : ""}`}
            >
              <title>{`${t("ui.measure")} ${currentMeasure}: ${event.pitch ? pitchName(event.pitch, locale) : t("ui.rest")}`}</title>
              {active && <rect x={x - 18} y="22" width="36" height="121" rx="9" className="note-highlight" />}
              {event.pitch ? (
                <>
                  {ledger.map((step) => (
                    <line
                      key={step}
                      x1={x - 12}
                      x2={x + 12}
                      y1={103 - step * 6}
                      y2={103 - step * 6}
                      className="ledger-line"
                    />
                  ))}
                  {event.pitch.alter !== 0 && (
                    <text x={x - 24} y={y + 7} fontSize="24" className="accidental">
                      {event.pitch.alter === 1 ? "♯" : "♭"}
                    </text>
                  )}
                  <ellipse
                    cx={x}
                    cy={y}
                    rx="7.7"
                    ry="5.2"
                    transform={`rotate(-18 ${x} ${y})`}
                    className={duration >= 2 ? "note-head hollow" : "note-head"}
                  />
                  {duration < 4 && <line x1={stemX} x2={stemX} y1={y} y2={stemEnd} className="note-stem" />}
                  {duration < 1 && (
                    <path
                      d={`M ${stemX} ${stemEnd} q 20 ${up ? 12 : -12} 6 ${up ? 25 : -25}`}
                      className="note-stem"
                      fill="none"
                    />
                  )}
                  {event.duration.n === 3 && <circle cx={x + 16} cy={y - 2} r="2" className="note-head" />}
                </>
              ) : (
                <text x={x - 9} y="96" className="rest" fontSize="40">
                  {duration >= 2 ? "𝄼" : "𝄽"}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </section>
  );
}
