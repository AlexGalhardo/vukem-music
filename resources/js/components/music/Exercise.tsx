import { CircleCheck, RotateCcw } from "lucide-react";
import { type RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "../../lib/i18n";
import { useProgress } from "../../lib/progress";
import { pitchAt, pitchName, toMidi } from "../../music/theory";
import type { Lesson, Score as ScoreData } from "../../types";
import { Button } from "../ui/button";
import { Score } from "./Score";

export function Exercise({
  lesson,
  answerRef,
}: {
  lesson: Lesson;
  answerRef?: RefObject<((midi: number) => void) | null>;
}) {
  const { t, locale } = useI18n();
  const { answer } = useProgress();
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const notes = lesson.score.events.filter((event) => event.pitch);
  const target = notes[index % notes.length];
  const targetPitch = target.pitch ?? pitchAt(60);
  const targetMidi = toMidi(targetPitch);
  const score: ScoreData = useMemo(
    () => ({ ...lesson.score, id: `${lesson.id}-question`, events: [target] }),
    [lesson, target],
  );
  const choices = [...new Set([targetMidi, targetMidi + 2, targetMidi - 2, targetMidi + 4])].sort((a, b) => a - b);
  const submit = useCallback(
    (midi: number) => {
      if (result !== null) return;
      const correct = midi === targetMidi;
      setResult(correct);
      answer(correct);
    },
    [result, targetMidi, answer],
  );
  useEffect(() => {
    if (answerRef) answerRef.current = submit;
    return () => {
      if (answerRef) answerRef.current = null;
    };
  }, [answerRef, submit]);
  return (
    <section
      data-testid="exercise"
      className="space-y-5 rounded-2xl border bg-card p-6"
      aria-label={t("ui.exerciseTitle")}
    >
      <div>
        <p className="eyebrow mb-2">{t("ui.exercise")}</p>
        <h2 className="text-xl font-semibold">{t("ui.exerciseTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("ui.exerciseBody")}</p>
      </div>
      <Score score={score} />
      <div className="flex flex-wrap gap-3">
        {choices.map((midi) => (
          <Button key={midi} variant="outline" type="button" disabled={result !== null} onClick={() => submit(midi)}>
            {pitchName(midi === targetMidi ? targetPitch : pitchAt(midi), locale)}
          </Button>
        ))}
      </div>
      <div aria-live="polite">
        {result !== null ? (
          <div className="space-y-3">
            <p className={`flex items-center gap-2 text-sm ${result ? "text-primary" : "text-foreground"}`}>
              {result && <CircleCheck size={17} />}
              {t(result ? "ui.correct" : "ui.incorrect")} {pitchName(targetPitch, locale)}.
            </p>
            <p className="text-xs text-muted-foreground">{t("ui.exerciseHint")}</p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setIndex(index + 1);
                setResult(null);
              }}
            >
              <RotateCcw size={14} />
              {t("ui.tryAgain")}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("ui.exerciseHint")}</p>
        )}
      </div>
    </section>
  );
}
