import { type ReactNode, useState } from "react";
import { useI18n } from "../../lib/i18n";
import type { MusicDocument } from "../../music/musicxml";
import type { Tuning } from "../../music/tuning";
import { usePerformance } from "../../music/use-performance";
import { Button } from "../ui/button";
import { Piano } from "./Piano";
import { PolyphonicScore } from "./PolyphonicScore";

function ValidatedPlayer({
  document,
  renderScore,
}: {
  document: MusicDocument;
  renderScore?: (beat: number, playing: boolean) => ReactNode;
}) {
  const { t } = useI18n();
  const [bpm, setBpm] = useState(80);
  const [transpose, setTranspose] = useState(0);
  const [tuning, setTuning] = useState<Tuning>("equal");
  const transport = usePerformance(document, bpm, transpose, tuning);
  const active = transport.active.map((event) => event.midi);
  return (
    <div className="space-y-5" data-testid="advanced-player">
      {renderScore ? (
        renderScore(transport.sourceBeat, transport.status === "playing")
      ) : (
        <PolyphonicScore
          document={document}
          sourceBeat={transport.sourceBeat}
          playing={transport.status === "playing"}
        />
      )}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
        <Button
          disabled={transport.status === "loading"}
          onClick={() => (transport.status === "playing" ? transport.pause() : void transport.play())}
        >
          {t(transport.status === "playing" ? "ui.pause" : "ui.play")}
        </Button>
        <Button variant="outline" onClick={transport.stop}>
          {t("ui.stop")}
        </Button>
        <output className="text-xs tabular-nums">
          {transport.position.toFixed(1)} / {transport.total.toFixed(1)}s
        </output>
        <label className="grid gap-1 text-sm">
          {t("ui.tempo")} ♩
          <input
            aria-label={t("ui.practiceTempo")}
            type="number"
            min="20"
            max="300"
            value={bpm}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n >= 20 && n <= 300) setBpm(n);
            }}
            className="w-20 rounded border bg-card p-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          {t("ui.soundTranspose")}
          <select
            aria-label={t("ui.soundTranspose")}
            value={transpose}
            onChange={(e) => setTranspose(Number(e.target.value))}
            className="rounded border bg-card p-2"
          >
            {[-12, -7, -5, -2, -1, 0, 1, 2, 5, 7, 12].map((n) => (
              <option key={n} value={n}>
                {n > 0 ? "+" : ""}
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          {t("ui.tuning")}
          <select
            aria-label={t("ui.tuning")}
            value={tuning}
            onChange={(e) => setTuning(e.target.value as Tuning)}
            className="max-w-full rounded border bg-card p-2"
          >
            {["equal", "just-c", "pythagorean-c"].map((value) => (
              <option key={value} value={value}>
                {t(`ui.tuning-${value}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-xs leading-6 text-muted-foreground">
        {t(transport.mode === "samples" ? "ui.samples" : "ui.synth")} · {t("ui.transposeNotice")}
      </p>
      {tuning !== "equal" && <p className="text-sm text-muted-foreground">{t("ui.tuningNotice")}</p>}
      {transport.error && <p role="alert">{t("ui.audioError")}</p>}
      <Piano activeMidi={active[0]} activeMidis={active} onNote={transport.manual} />
    </div>
  );
}
export function AdvancedPlayer({
  document,
  renderScore,
}: {
  document: MusicDocument;
  renderScore?: (beat: number, playing: boolean) => ReactNode;
}) {
  const { t } = useI18n();
  if (document.issues.some((i) => i.severity === "error"))
    return (
      <p role="alert" className="rounded-lg border p-4">
        {t("ui.unsupportedScore")}
      </p>
    );
  // Validate tie resolution and repeat traversal before mounting audio controls.
  return <ValidatedPlayer document={document} renderScore={renderScore} />;
}
