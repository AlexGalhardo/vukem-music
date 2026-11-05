import { Pause, Play, RotateCcw, Square, Volume2 } from "lucide-react";
import { useId, useState } from "react";
import { useI18n } from "../../lib/i18n";
import { toMidi } from "../../music/theory";
import { useTransport } from "../../music/use-transport";
import type { Score as ScoreData } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Piano } from "./Piano";
import { Score } from "./Score";

export function Player({ score, onAnswer }: { score: ScoreData; onAnswer?: (midi: number) => void }) {
  const { t } = useI18n();
  const [bpm, setBpm] = useState(80);
  const tempoId = useId();
  const transport = useTransport(score, bpm);
  const playing = transport.status === "playing";
  const loading = transport.status === "loading";
  const activeMidi = transport.active?.pitch ? toMidi(transport.active.pitch) : undefined;
  return (
    <div className="space-y-5" data-testid="player">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t("ui.hear")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t("ui.scoreBody")}</p>
        </div>
        <Badge variant="secondary" className="gap-1.5 py-1.5 font-normal">
          <Volume2 size={12} />
          {t(transport.mode === "samples" ? "ui.samples" : "ui.synth")}
        </Badge>
      </div>
      <Score score={score} activeId={transport.active?.id} />
      <div className="flex flex-wrap items-center justify-between gap-5 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => (playing ? transport.pause() : void transport.play())}
            disabled={loading}
            aria-label={t(playing ? "ui.pause" : "ui.play")}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
            {t(loading ? "ui.loadingAudio" : playing ? "ui.pause" : "ui.play")}
          </Button>
          <Button type="button" size="icon" variant="outline" onClick={transport.stop} aria-label={t("ui.stop")}>
            <Square size={13} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => {
              transport.stop();
              void transport.play();
            }}
            disabled={loading}
            aria-label={t("ui.replay")}
          >
            <RotateCcw size={15} />
          </Button>
          <output className="ml-2 min-w-14 text-xs tabular-nums text-muted-foreground" aria-live="off">
            {transport.position.toFixed(1)} / {transport.total.toFixed(1)}s
          </output>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor={tempoId} className="text-xs text-muted-foreground">
            {t("ui.tempo")}
          </label>
          <input
            id={tempoId}
            type="range"
            min="40"
            max="160"
            step="5"
            value={bpm}
            onChange={(event) => setBpm(Number(event.target.value))}
            className="w-24 accent-primary"
          />
          <output className="w-20 text-xs font-medium tabular-nums">
            {bpm} <span className="text-muted-foreground">BPM ♩</span>
          </output>
        </div>
      </div>
      {transport.error && (
        <p role="status" className="text-sm text-muted-foreground">
          {t(transport.error)}
        </p>
      )}
      <Piano activeMidi={activeMidi} onNote={transport.manual} onAnswer={onAnswer} />
      <p className="text-[10px] text-muted-foreground">{t("ui.convention")}</p>
    </div>
  );
}
