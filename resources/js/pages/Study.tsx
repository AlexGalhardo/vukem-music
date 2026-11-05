import { Head, Link } from "@inertiajs/react";
import { ArrowRight, BookOpen, Check, CircleCheck, Clock3, GraduationCap, Piano, Sparkles, Target } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Exercise } from "../components/music/Exercise";
import { Player } from "../components/music/Player";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/progress";
import type { Lesson, StudyProps } from "../types";

function LessonCard({ lesson }: { lesson: Lesson }) {
  const { t, local, href } = useI18n();
  const { progress } = useProgress();
  const done = progress.completed.includes(lesson.id);
  return (
    <Link
      href={href(`/lessons/${lesson.id}`)}
      className="lesson-card group flex items-center gap-4 rounded-xl border bg-card px-5 py-5 transition hover:border-primary/40 hover:shadow-sm"
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-sm ${done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
      >
        {done ? <Check size={18} /> : String(lesson.order).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-1 block text-[10px] tracking-wider text-muted-foreground">
          {t("ui.lesson")} {String(lesson.order).padStart(2, "0")}
        </span>
        <span className="block text-sm font-semibold">{local(lesson.title)}</span>
        <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">{local(lesson.description)}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-3">
        <span className="text-[10px] text-muted-foreground">
          {lesson.minutes} {t("ui.minutes")}
        </span>
        <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
      </span>
    </Link>
  );
}

function HeroArt() {
  return (
    <div className="hero-art hidden w-[32%] items-center justify-center lg:flex" aria-hidden="true">
      <div className="relative">
        <div className="hero-orbit" />
        <span className="absolute -top-5 left-5 text-5xl text-primary/60">♫</span>
        <span className="absolute top-4 -right-5 text-3xl text-primary/50">♩</span>
        <div className="hero-keyboard">
          {["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5"].map((key) => (
            <div key={key} className="hero-white">
              {["C4", "D4", "F4", "G4", "A4", "C5", "D5"].includes(key) && <span className="hero-black" />}
            </div>
          ))}
        </div>
        <span className="absolute -bottom-12 left-20 text-4xl text-primary/60">𝄞</span>
      </div>
    </div>
  );
}

export default function Study({ lessons, view, selected }: StudyProps) {
  const { t, local, href } = useI18n();
  const { progress, complete, reset } = useProgress();
  const exerciseAnswer = useRef<((midi: number) => void) | null>(null);
  const onPianoAnswer = useCallback((midi: number) => exerciseAnswer.current?.(midi), []);
  const [practiceId, setPracticeId] = useState(lessons[0]?.id ?? "");
  const current = lessons.find((lesson) => lesson.id === selected) ?? lessons[0];
  const practice = lessons.find((lesson) => lesson.id === practiceId) ?? lessons[0];
  const completed = lessons.filter((lesson) => progress.completed.includes(lesson.id)).length;
  const next = lessons.find((lesson) => !progress.completed.includes(lesson.id)) ?? lessons[0];
  const accuracy = progress.attempts ? Math.round((progress.correct / progress.attempts) * 100) : 0;
  const title = view === "lesson" ? local(current.title) : t(`nav.${view}`);
  if (!current) return null;
  return (
    <>
      <Head title={`${title} · Vukem Music`} />
      {view === "overview" && (
        <div className="space-y-9">
          <section className="hero-panel relative flex min-h-[258px] items-center overflow-hidden rounded-2xl border px-7 py-9 lg:px-10">
            <div className="relative z-10 max-w-[590px] flex-1">
              <p className="eyebrow mb-4 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                {t("ui.beginner")}
              </p>
              <h1 className="hero-title max-w-[490px] text-4xl leading-[1.15] tracking-tight lg:text-[46px]">
                {t("ui.welcome")}
              </h1>
              <p className="mt-4 max-w-[420px] text-sm leading-7 text-muted-foreground">{t("ui.welcomeBody")}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild>
                  <Link href={href(`/lessons/${next.id}`)}>
                    {t(completed ? "ui.continue" : "ui.start")}
                    <ArrowRight size={15} />
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href={href("/practice")}>
                    {t("ui.openStudio")}
                    <Piano size={16} />
                  </Link>
                </Button>
              </div>
            </div>
            <HeroArt />
          </section>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: BookOpen, value: `${completed} / ${lessons.length}`, label: t("ui.lessonsCompleted") },
              { icon: Target, value: `${accuracy}%`, label: t("ui.accuracy") },
              { icon: Sparkles, value: String(progress.correct), label: t("ui.exerciseScore") },
            ].map((stat) => (
              <Card key={stat.label} className="flex-row items-center gap-4 px-5 py-5 shadow-none">
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-primary">
                  <stat.icon size={18} />
                </span>
                <div>
                  <p className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </Card>
            ))}
          </div>
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">{t("ui.learningPath")}</p>
                <h2 className="section-title text-2xl">{t("ui.course")}</h2>
              </div>
              <Link
                href={href("/lessons")}
                className="flex items-center gap-2 text-xs font-medium text-primary hover:underline"
              >
                {t("ui.allLessons")}
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid gap-4 xl:grid-cols-[1fr_0.7fr]">
              <div className="grid gap-3">
                {lessons.slice(0, 3).map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
              <Card className="studio-card justify-between p-7 shadow-none">
                <div>
                  <Piano className="mb-5 size-8 text-primary" strokeWidth={1.2} />
                  <p className="eyebrow mb-2">{t("ui.nextUp")}</p>
                  <h3 className="section-title text-2xl">{t("ui.quickPractice")}</h3>
                  <p className="mt-3 max-w-64 text-sm leading-6 text-muted-foreground">{t("ui.quickBody")}</p>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 size={13} />5 {t("ui.minutes")}
                  </span>
                  <Button asChild variant="outline" className="bg-card">
                    <Link href={href("/practice")}>
                      {t("ui.openStudio")}
                      <ArrowRight size={14} />
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </section>
          <div className="flex items-center gap-3 rounded-xl border border-dashed px-5 py-4 text-xs text-muted-foreground">
            <GraduationCap size={19} className="shrink-0 text-primary" />
            <span>
              {t("ui.tagline")} <span className="hidden sm:inline">{t("ui.local")}</span>
            </span>
          </div>
        </div>
      )}
      {view === "lessons" && (
        <div className="space-y-7">
          <div>
            <p className="eyebrow mb-3">{t("ui.beginner")}</p>
            <h1 className="section-title text-4xl">{t("ui.course")}</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{t("ui.courseBody")}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </div>
      )}
      {view === "lesson" && (
        <article className="mx-auto max-w-5xl space-y-8">
          <Link className="text-xs text-muted-foreground hover:text-primary" href={href("/lessons")}>
            ← {t("ui.backLessons")}
          </Link>
          <header>
            <div className="mb-3 flex items-center gap-3">
              <Badge variant="secondary">
                {t("ui.lesson")} {current.order}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {current.minutes} {t("ui.minutes")}
              </span>
            </div>
            <h1 className="section-title text-4xl">{local(current.title)}</h1>
            <p className="mt-3 text-muted-foreground">{local(current.description)}</p>
          </header>
          <section className="max-w-3xl space-y-4">
            <h2 className="eyebrow">{t("ui.study")}</h2>
            {local(current.body).map((paragraph) => (
              <p key={paragraph.slice(0, 60)} className="text-[15px] leading-8 text-muted-foreground">
                {paragraph}
              </p>
            ))}
            <p className="text-[10px] text-muted-foreground">
              {t("ui.sourceNote")} {current.chapter} ·{" "}
              <a
                href="https://github.com/AlexGalhardo/vukem-music/blob/main/docs/study-reference.md"
                className="underline"
              >
                Teoria da Música, 5ª ed.
              </a>
            </p>
          </section>
          <Player key={current.id} score={current.score} onAnswer={onPianoAnswer} />
          <Exercise key={`${current.id}-exercise`} lesson={current} answerRef={exerciseAnswer} />
          <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
            <Button
              type="button"
              onClick={() => complete(current.id)}
              disabled={progress.completed.includes(current.id)}
            >
              <CircleCheck size={16} />
              {t(progress.completed.includes(current.id) ? "ui.completed" : "ui.complete")}
            </Button>
            {lessons[current.order] && (
              <Button variant="ghost" asChild>
                <Link href={href(`/lessons/${lessons[current.order].id}`)}>
                  {t("ui.nextLesson")}
                  <ArrowRight size={15} />
                </Link>
              </Button>
            )}
          </div>
        </article>
      )}
      {view === "practice" && (
        <section className="space-y-7">
          <header>
            <p className="eyebrow mb-3">{t("nav.practice")}</p>
            <h1 className="section-title text-4xl">{t("ui.practiceTitle")}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{t("ui.practiceBody")}</p>
          </header>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="study-select" className="text-sm">
              {t("ui.selectStudy")}
            </label>
            <select
              id="study-select"
              value={practiceId}
              onChange={(event) => setPracticeId(event.target.value)}
              className="max-w-full rounded-lg border bg-card px-3 py-2 text-sm"
            >
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {String(lesson.order).padStart(2, "0")} · {local(lesson.title)}
                </option>
              ))}
            </select>
          </div>
          <Card className="p-5 shadow-none md:p-7">
            <Player key={practice.id} score={practice.score} />
          </Card>
        </section>
      )}
      {view === "progress" && (
        <section className="space-y-7">
          <header>
            <p className="eyebrow mb-3">{t("nav.progress")}</p>
            <h1 className="section-title text-4xl">{t("ui.progressTitle")}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{t("ui.progressBody")}</p>
          </header>
          <Card className="space-y-4 p-6 shadow-none">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t("ui.lessonsCompleted")}</h2>
              <span className="text-sm">
                {completed}/{lessons.length}
              </span>
            </div>
            <Progress value={(completed / lessons.length) * 100} aria-label={t("ui.lessonsCompleted")} />
            <div className="grid gap-4 pt-3 sm:grid-cols-3">
              {[
                [t("ui.attempts"), progress.attempts],
                [t("ui.exerciseScore"), progress.correct],
                [t("ui.accuracy"), `${accuracy}%`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </Card>
          {completed === 0 && <p className="text-sm text-muted-foreground">{t("ui.emptyProgress")}</p>}
          <div className="grid gap-3 lg:grid-cols-2">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
            <p className="text-xs text-muted-foreground">{t("ui.local")}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm(t("ui.resetConfirm"))) reset();
              }}
            >
              {t("ui.reset")}
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
