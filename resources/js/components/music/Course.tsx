import { useRef, useState } from "react";
import topics from "../../data/course.json";
import { useCourseProgress } from "../../lib/course-progress";
import { useI18n } from "../../lib/i18n";
import { type ChordQuality, chordPitches, rootSteps } from "../../music/harmony";
import { intervalBetween, matchesPitches, type ScaleMode, spellScale } from "../../music/semantics";
import { pitchName } from "../../music/theory";
import type { Pitch } from "../../types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

function Construction() {
  const { t, locale } = useI18n();
  const [step, setStep] = useState<Pitch["step"]>("C");
  const [kind, setKind] = useState("scale");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [mode, setMode] = useState<ScaleMode>("major");
  const expected =
    kind === "scale"
      ? spellScale({ step, octave: 4, alter: 0 }, mode)
      : chordPitches({ step, octave: 4, alter: 0 }, kind === "chord" ? "minor" : (kind as ChordQuality));
  return (
    <Card className="gap-4 p-5 shadow-none">
      <h2 className="text-xl font-semibold">{t("ui.constructionTitle")}</h2>
      <p className="text-sm leading-7 text-muted-foreground">{t("ui.constructionBody")}</p>
      <div className="grid gap-3 sm:flex sm:flex-wrap">
        <label className="grid gap-1 text-sm">
          {t("ui.exerciseType")}
          <select
            aria-label={t("ui.exerciseType")}
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setResult(null);
            }}
            className="rounded border bg-card p-2"
          >
            <option value="scale">{t("ui.buildScale")}</option>
            <option value="chord">{t("ui.buildMinorChord")}</option>
            {["dominant7", "major7", "minor7", "diminished7", "dominant9", "major9", "minor9", "dominant7Sharp5"].map(
              (quality) => (
                <option key={quality} value={quality}>
                  {t(`ui.${quality}`)}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          {t("ui.chordRoot")}
          <select
            aria-label={t("ui.chordRoot")}
            value={step}
            onChange={(e) => {
              setStep(e.target.value as Pitch["step"]);
              setResult(null);
            }}
            className="rounded border bg-card p-2"
          >
            {rootSteps.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        {kind === "scale" && (
          <label className="grid gap-1 text-sm">
            {t("ui.scaleMode")}
            <select
              aria-label={t("ui.scaleMode")}
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as ScaleMode);
                setResult(null);
              }}
              className="rounded border bg-card p-2"
            >
              {[
                "major",
                "naturalMinor",
                "harmonicMinor",
                "melodicMinorAscending",
                "dorian",
                "phrygian",
                "lydian",
                "mixolydian",
                "locrian",
                "wholeTone",
                "majorPentatonic",
              ].map((m) => (
                <option key={m} value={m}>
                  {t(`ui.mode-${m}`)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <label className="grid gap-2 text-sm" htmlFor="construction-answer">
        {t("ui.noteAnswer")}
        <input
          id="construction-answer"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setResult(null);
          }}
          className="rounded border bg-card px-3 py-2"
          placeholder="C D E F G A B"
        />
      </label>
      <Button
        className="w-fit"
        onClick={() =>
          setResult(
            matchesPitches(input, expected, {
              ordered: kind === "scale",
              enharmonic: kind === "scale" && mode === "wholeTone",
            }),
          )
        }
      >
        {t("ui.checkAnswer")}
      </Button>
      {result !== null && (
        <p role="status" className="text-sm">
          {t(result ? "ui.constructionCorrect" : "ui.constructionIncorrect")}{" "}
          {expected.map((p) => pitchName(p, locale).replace(/[0-8]/g, "")).join(" – ")}
        </p>
      )}
    </Card>
  );
}
function IntervalExercise() {
  const { t, locale } = useI18n();
  const examples: [Pitch, Pitch][] = [
    [
      { step: "C", octave: 4, alter: 0 },
      { step: "E", octave: 4, alter: -1 },
    ],
    [
      { step: "C", octave: 4, alter: 0 },
      { step: "F", octave: 4, alter: 1 },
    ],
    [
      { step: "C", octave: 4, alter: 0 },
      { step: "G", octave: 4, alter: -1 },
    ],
    [
      { step: "D", octave: 4, alter: 0 },
      { step: "A", octave: 4, alter: 0 },
    ],
    [
      { step: "C", octave: 4, alter: 0 },
      { step: "D", octave: 5, alter: 0 },
    ],
  ];
  const [index, setIndex] = useState(0);
  const [number, setNumber] = useState(3);
  const [quality, setQuality] = useState("major");
  const [result, setResult] = useState<boolean | null>(null);
  const pair = examples[index % examples.length];
  const expected = intervalBetween(...pair);
  return (
    <Card className="gap-4 p-5 shadow-none">
      <h2 className="text-xl font-semibold">{t("ui.intervalTitle")}</h2>
      <p className="text-sm leading-7 text-muted-foreground">{t("ui.intervalBody")}</p>
      <p className="text-xl font-semibold">{pair.map((p) => pitchName(p, locale)).join(" → ")}</p>
      <div className="flex flex-wrap gap-3">
        <select
          aria-label={t("ui.intervalNumber")}
          value={number}
          onChange={(e) => {
            setNumber(Number(e.target.value));
            setResult(null);
          }}
          className="rounded border bg-card p-2"
        >
          {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        <select
          aria-label={t("ui.intervalQuality")}
          value={quality}
          onChange={(e) => {
            setQuality(e.target.value);
            setResult(null);
          }}
          className="rounded border bg-card p-2"
        >
          {["perfect", "major", "minor", "augmented", "diminished"].map((q) => (
            <option key={q} value={q}>
              {t(`ui.${q}`)}
            </option>
          ))}
        </select>
        <Button onClick={() => setResult(number === expected.number && quality === expected.quality)}>
          {t("ui.checkAnswer")}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setIndex(index + 1);
            setResult(null);
          }}
        >
          {t("ui.tryAgain")}
        </Button>
      </div>
      {result !== null && (
        <p role="status">
          {t(result ? "ui.constructionCorrect" : "ui.constructionIncorrect")} {expected.number} ·{" "}
          {t(`ui.${expected.quality}`)} · {expected.semitones} {t("ui.semitones")}
        </p>
      )}
    </Card>
  );
}
export function Course() {
  const { t, local, locale } = useI18n();
  const { progress, read, answer, round: saveRound } = useCourseProgress();
  const [group, setGroup] = useState("");
  const [query, setQuery] = useState("");
  const [round, setRound] = useState<string[]>([]);
  const [at, setAt] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const locked = useRef(false);
  const [finished, setFinished] = useState(false);
  const current = topics.find((topic) => topic.id === round[at]);
  const groups = [...new Set(topics.map((topic) => topic.group))];
  const start = () => {
    const offset = (progress.rounds * 10) % topics.length;
    setRound(Array.from({ length: 10 }, (_, i) => topics[(offset + i * 7) % topics.length].id));
    setAt(0);
    setScore(0);
    setSelected(null);
    locked.current = false;
    setFinished(false);
  };
  return (
    <section className="space-y-7">
      <header>
        <p className="eyebrow mb-3">{t("nav.course")}</p>
        <h1 className="section-title text-4xl">{t("ui.fullCourseTitle")}</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{t("ui.fullCourseBody")}</p>
        <p className="mt-3 text-sm">
          {progress.read.length}/58 {t("ui.topicsRead")} · {t("ui.bestRound")}: {progress.best}/10
        </p>
      </header>
      <Card className="gap-4 p-5 shadow-none">
        <h2 className="text-xl font-semibold">{t("ui.reviewRound")}</h2>
        <p className="text-sm leading-7 text-muted-foreground">{t("ui.reviewRoundBody")}</p>
        <Button onClick={start} className="w-fit">
          {t("ui.startRound")}
        </Button>
        {current && !finished && (
          <div className="space-y-4" data-testid="course-question" data-question-id={current.id}>
            <p className="text-xs">{at + 1}/10</p>
            <h3 className="font-semibold">{local(current.question)}</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {local(current.options).map((option, index) => (
                <Button
                  key={option}
                  variant="outline"
                  disabled={selected !== null}
                  onClick={() => {
                    if (locked.current) return;
                    locked.current = true;
                    setSelected(index);
                    const correct = index === current.correct;
                    answer(correct);
                    if (correct) setScore((s) => s + 1);
                  }}
                >
                  {option}
                </Button>
              ))}
            </div>
            {selected !== null && (
              <div className="space-y-3">
                <p role="status">
                  {t(selected === current.correct ? "ui.constructionCorrect" : "ui.constructionIncorrect")}{" "}
                  {local(current.body)}
                </p>
                <Button
                  onClick={() => {
                    if (at === 9) {
                      saveRound(score);
                      setFinished(true);
                    } else {
                      setAt(at + 1);
                      setSelected(null);
                      locked.current = false;
                    }
                  }}
                >
                  {t(at === 9 ? "ui.finishRound" : "ui.nextQuestion")}
                </Button>
              </div>
            )}
          </div>
        )}
        {finished && (
          <p role="status" className="font-semibold">
            {score}/10 · {t(score >= 8 ? "ui.roundPassed" : "ui.roundPractice")}
          </p>
        )}
      </Card>
      <div className="grid gap-5 xl:grid-cols-2">
        <Construction />
        <IntervalExercise />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm" htmlFor="course-search">
          {t("ui.searchTopics")}
          <input
            id="course-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded border bg-card p-2"
          />
        </label>
        <label className="grid gap-2 text-sm" htmlFor="course-group">
          {t("ui.topicGroup")}
          <select
            id="course-group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="rounded border bg-card p-2"
          >
            <option value="">{t("ui.allTopics")}</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {t(`ui.group-${g}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {topics
          .filter(
            (topic) =>
              (!group || group === topic.group) &&
              local(topic.title).toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale)),
          )
          .map((topic) => (
            <Card key={topic.id} data-testid="course-topic" className="gap-4 p-5 shadow-none">
              <p className="eyebrow">
                {t(`ui.group-${topic.group}`)} · {topic.chapter}
              </p>
              <h2 className="text-xl font-semibold">{local(topic.title)}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{local(topic.body)}</p>
              <a
                className="text-xs text-primary underline"
                href={`https://github.com/AlexGalhardo/vukem-music/blob/main/docs/study-${String(topic.chapter).padStart(2, "0")}.md`}
                target="_blank"
                rel="noreferrer"
              >
                {t("ui.sourceNote")} {topic.chapter}
              </a>
              <Button
                variant="outline"
                className="w-fit"
                disabled={progress.read.includes(topic.id)}
                onClick={() => read(topic.id)}
              >
                {t(progress.read.includes(topic.id) ? "ui.read" : "ui.markRead")}
              </Button>
            </Card>
          ))}
      </div>
    </section>
  );
}
