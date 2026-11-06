import { Link } from "@inertiajs/react";
import { useCallback, useEffect, useRef, useState } from "react";
import repertoire from "../../data/repertoire.json";
import { useI18n } from "../../lib/i18n";
import { type MusicDocument, performance } from "../../music/musicxml";
import { AdvancedPlayer } from "./AdvancedPlayer";

interface NativeDocument extends MusicDocument {
  ink: { id: string; start: number; end: number }[];
  pages: { url: string; sha256: string }[];
  edition: {
    license: string;
    editor: string;
    sourceUrl: string;
    unfolded: boolean;
    part?: string;
    newTranscription?: boolean;
  };
}
async function verified(url: string, expected: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("score-unavailable");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > 8 * 1024 * 1024) throw new Error("score-size");
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  if (hash !== expected) throw new Error("score-checksum");
  return new TextDecoder().decode(bytes);
}
function NativeScore({
  document,
  pages,
  beat,
  playing,
}: {
  document: NativeDocument;
  pages: string[];
  beat: number;
  playing: boolean;
}) {
  const { t } = useI18n();
  const viewer = useRef<HTMLElement>(null);
  useEffect(() => {
    const active = new Set(
      playing
        ? document.ink.filter((note) => beat + 1e-7 >= note.start && beat < note.end - 1e-7).map((note) => note.id)
        : [],
    );
    const visible: Element[] = [];
    for (const element of viewer.current?.querySelectorAll<SVGGElement>("[data-source]") ?? []) {
      const on = active.has(element.dataset.source ?? "");
      if (element.dataset.active !== String(on)) {
        element.dataset.active = String(on);
        element.style.color = on ? "#406a45" : "";
      }
      if (on) visible.push(element);
    }
    const container = viewer.current;
    if (!container || !visible.length) return;
    const bounds = container.getBoundingClientRect();
    if (
      visible.some((element) => {
        const r = element.getBoundingClientRect();
        return r.top >= bounds.top && r.bottom <= bounds.bottom && r.left >= bounds.left && r.right <= bounds.right;
      })
    )
      return;
    const rect = visible[0].getBoundingClientRect();
    container.scrollTop += rect.top - bounds.top - container.clientHeight / 2;
    container.scrollLeft += rect.left - bounds.left - container.clientWidth / 2;
  }, [document, beat, playing]);
  return (
    <section
      ref={viewer}
      className="max-h-[650px] overflow-auto rounded-xl border bg-white p-3 text-black"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: The score scroll region is keyboard reachable.
      tabIndex={0}
      aria-label={t("ui.score")}
    >
      {pages.map((svg, index) => (
        <div
          key={document.pages[index].url}
          className="native-score min-w-[700px]" // Only build-sanitized, hash-verified assets from our curated sources reach this sink.
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized during the score build; fetched assets are SHA-256 verified.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ))}
    </section>
  );
}
export function LibraryPlayer({ id }: { id: string }) {
  const { t, local, href } = useI18n();
  const [document, setDocument] = useState<NativeDocument | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const work = repertoire.find((item) => item.id === id);
  useEffect(() => {
    let cancelled = false;
    setDocument(null);
    setPages([]);
    setError(false);
    void fetch("/generated-scores/catalog.json")
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const catalog = (await response.json()) as Record<string, { url: string; sha256: string }>;
        const item = catalog[id];
        if (!item || item.url !== `/generated-scores/${id}.json`) throw new Error();
        const doc = JSON.parse(await verified(item.url, item.sha256)) as NativeDocument;
        if (!Array.isArray(doc.notes) || !Array.isArray(doc.ink) || !Array.isArray(doc.pages) || doc.pages.length > 32)
          throw new Error();
        performance(doc, 80);
        const svgs = await Promise.all(
          doc.pages.map((page) => {
            if (!page.url.startsWith(`/generated-scores/${id}-`) || !page.url.endsWith(".svg")) throw new Error();
            return verified(page.url, page.sha256);
          }),
        );
        if (cancelled) return;
        setPages(svgs);
        setDocument(doc);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  const render = useCallback(
    (beat: number, playing: boolean) =>
      document ? <NativeScore document={document} pages={pages} beat={beat} playing={playing} /> : null,
    [document, pages],
  );
  return (
    <section className="space-y-6">
      <Link href={href("/library")} className="text-sm text-primary underline">
        ← {t("nav.library")}
      </Link>
      <h1 className="section-title text-4xl">{work ? local(work.title) : t("ui.score")}</h1>
      {work && (
        <p className="text-sm text-muted-foreground">
          {work.composer} · {work.catalogue}
        </p>
      )}
      <p className="text-sm leading-7 text-muted-foreground">{t("ui.nativeStudyNotice")}</p>
      {error ? (
        <p role="alert">{t("ui.nativeUnavailable")}</p>
      ) : !document ? (
        <p role="status">{t("ui.loadingScore")}</p>
      ) : (
        <>
          {document.edition.newTranscription && (
            <p className="text-sm leading-7 text-muted-foreground">{t("ui.nativeNewTranscription")}</p>
          )}
          {document.edition.part === "student-primo" && (
            <p className="text-sm leading-7 text-muted-foreground">{t("ui.nativeStudentPart")}</p>
          )}
          <AdvancedPlayer document={document} renderScore={render} />
          <p className="text-xs leading-6 text-muted-foreground">
            {document.edition.license} · {document.edition.editor} ·{" "}
            <a href={document.edition.sourceUrl} target="_blank" rel="noreferrer" className="underline">
              {t("ui.scoreSource")}
            </a>
          </p>
        </>
      )}
    </section>
  );
}
