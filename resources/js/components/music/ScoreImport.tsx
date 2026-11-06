import { useState } from "react";
import { useI18n } from "../../lib/i18n";
import { importMusicXML, type MusicDocument, performance } from "../../music/musicxml";
import { Card } from "../ui/card";
import { AdvancedPlayer } from "./AdvancedPlayer";

export function ScoreImport() {
  const { t } = useI18n();
  const [document, setDocument] = useState<MusicDocument | null>(null);
  const [error, setError] = useState("");
  const load = (xml: string) => {
    try {
      const parsed = importMusicXML(xml);
      if (!parsed.issues.some((i) => i.severity === "error")) performance(parsed, 80);
      setDocument(parsed);
      setError("");
    } catch (e) {
      setDocument(null);
      setError(e instanceof Error ? e.message : "xml-malformed");
    }
  };
  return (
    <section className="space-y-7">
      <header>
        <p className="eyebrow mb-3">{t("nav.import")}</p>
        <h1 className="section-title text-4xl">{t("ui.importTitle")}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{t("ui.importBody")}</p>
      </header>
      <Card className="gap-4 p-5 shadow-none">
        <label htmlFor="xml-file" className="text-sm font-medium">
          {t("ui.chooseMusicXML")}
        </label>
        <input
          id="xml-file"
          type="file"
          accept=".xml,.musicxml,application/xml,text/xml"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
              setError("xml-size");
              setDocument(null);
              return;
            }
            void file
              .text()
              .then(load)
              .catch(() => setError("xml-malformed"));
          }}
          className="max-w-full text-sm"
        />
        <button
          type="button"
          onClick={() => {
            void fetch("/scores/original-polyphony.musicxml")
              .then((r) => {
                if (!r.ok) throw new Error();
                return r.text();
              })
              .then(load)
              .catch(() => setError("xml-malformed"));
          }}
          className="w-fit text-sm text-primary underline"
        >
          {t("ui.loadPolyphonyDemo")}
        </button>
        <button
          type="button"
          onClick={() => {
            void fetch("/scores/original-rhythm.musicxml")
              .then((r) => {
                if (!r.ok) throw new Error();
                return r.text();
              })
              .then(load)
              .catch(() => setError("xml-malformed"));
          }}
          className="w-fit text-sm text-primary underline"
        >
          {t("ui.loadRhythmDemo")}
        </button>
        <p className="text-xs leading-6 text-muted-foreground">{t("ui.importPrivacy")}</p>
        {error && (
          <p role="alert" className="text-sm">
            {t("ui.importError")}{" "}
            {t(`ui.issue-${error}`) === `ui.issue-${error}` ? t("ui.unsupportedScore") : t(`ui.issue-${error}`)}
          </p>
        )}
      </Card>
      {document && (
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold">{document.title}</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {document.issues.map((issue) => (
              <li key={issue.code}>
                {t(`ui.issue-${issue.code}`) === `ui.issue-${issue.code}`
                  ? `${t("ui.unsupportedFeature")}: ${issue.code}`
                  : t(`ui.issue-${issue.code}`)}
              </li>
            ))}
          </ul>
          <AdvancedPlayer key={document.xml} document={document} />
        </div>
      )}
    </section>
  );
}
