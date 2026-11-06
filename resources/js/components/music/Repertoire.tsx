import { Link } from "@inertiajs/react";
import { useState } from "react";
import sources from "../../../../scores/manifest.json";
import repertoire from "../../data/repertoire.json";
import { useI18n } from "../../lib/i18n";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

export function Repertoire() {
  const { t, local, href } = useI18n();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const needle = search
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  const works = repertoire
    .filter((work) => {
      const text = `${local(work.title)} ${work.composer} ${work.catalogue}`
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
      return text.includes(needle) && (level === "" || work.level === Number(level));
    })
    .sort((a, b) => a.level - b.level || a.order - b.order);
  return (
    <section className="space-y-7">
      <header>
        <p className="eyebrow mb-3">{t("nav.library")}</p>
        <h1 className="section-title text-4xl">{t("ui.libraryTitle")}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{t("ui.libraryBody")}</p>
      </header>
      <p className="rounded-xl border border-dashed p-4 text-sm leading-6 text-muted-foreground">
        {t("ui.libraryNotice")}
      </p>
      <div className="flex flex-wrap gap-4">
        <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm" htmlFor="score-search">
          {t("ui.searchScores")}
          <input
            id="score-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border bg-card px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm" htmlFor="score-level">
          {t("ui.filterLevel")}
          <select
            id="score-level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-lg border bg-card px-3 py-2"
          >
            <option value="">{t("ui.allLevels")}</option>
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {t(`ui.level${n}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p role="status" className="text-sm text-muted-foreground">
        {works.length} / 50 {t("ui.results")}
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        {works.map((work) => (
          <Card key={work.id} data-testid="repertoire-work" className="gap-3 p-5 shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant="secondary">{t(`ui.level${work.level}`)}</Badge>
              <span className="text-xs text-muted-foreground">{work.catalogue}</span>
            </div>
            <h2 className="text-lg font-semibold">{local(work.title)}</h2>
            <p className="text-sm">{work.composer}</p>
            <p className="text-sm leading-6 text-muted-foreground">{local(work.goal)}</p>
            <p className="text-xs leading-5 text-muted-foreground">{local(work.part)}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-primary">
              {sources.some((source) => source.id === work.id && source.review !== "pending") && (
                <Link href={href(`/library/${work.id}`)} className="underline underline-offset-4">
                  {t("ui.playStudyEdition")}
                </Link>
              )}
              <a href={work.pdfUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                {t("ui.openPdf")}
              </a>
              <a href={work.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                {t("ui.scoreSource")}
              </a>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              {work.license} · {work.editor}
            </p>
          </Card>
        ))}
      </div>
      {works.length === 0 && <p className="text-sm">{t("ui.noScores")}</p>}
    </section>
  );
}
