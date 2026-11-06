import type { GraphicalNote, OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../lib/i18n";
import type { MusicDocument } from "../../music/musicxml";

interface Mark {
  start: number;
  end: number;
  graph: GraphicalNote;
  active: boolean;
  element?: SVGGElement;
}
export function PolyphonicScore({
  document,
  sourceBeat,
  playing,
}: {
  document: MusicDocument;
  sourceBeat: number;
  playing: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const marks = useRef<Mark[]>([]);
  const [error, setError] = useState(false);
  const { t } = useI18n();
  useEffect(() => {
    let cancelled = false;
    let sheet: OpenSheetMusicDisplay | undefined;
    let observer: ResizeObserver | undefined;
    let timeout: ReturnType<typeof setTimeout>;
    let width = 0;
    setError(false);
    marks.current = [];
    void import("opensheetmusicdisplay")
      .then(async (module) => {
        const library = ("default" in module ? module.default : module) as typeof import("opensheetmusicdisplay");
        if (cancelled || !container.current) return;
        sheet = new library.OpenSheetMusicDisplay(container.current, {
          autoResize: false,
          backend: "svg",
          drawingParameters: "compacttight",
          drawTitle: true,
          followCursor: false,
        });
        // A Document prevents the library from treating short XML strings as URLs.
        await sheet.load(new DOMParser().parseFromString(document.xml, "application/xml"));
        if (cancelled) return;
        const render = () => {
          if (!sheet || cancelled) return;
          sheet.render();
          marks.current = [];
          const cursor = sheet.cursor;
          cursor.hide();
          cursor.reset();
          const iterator = cursor.Iterator.clone();
          let steps = 0;
          const seen = new Set<GraphicalNote>();
          while (!iterator.EndReached && steps++ < 50000) {
            const start = iterator.CurrentSourceTimestamp.RealValue * 4;
            for (const voice of iterator.CurrentVoiceEntries)
              for (const note of voice.Notes) {
                if (note.isRest()) continue;
                const graph = sheet.EngravingRules.GNote(note);
                if (!graph || seen.has(graph)) continue;
                seen.add(graph);
                const element = (graph as GraphicalNote & { getSVGGElement?: () => SVGGElement }).getSVGGElement?.();
                if (element) {
                  element.dataset.performanceNote = "true";
                  element.dataset.active = "false";
                }
                marks.current.push({ start, end: start + note.Length.RealValue * 4, graph, active: false, element });
              }
            iterator.moveToNext();
          }
          if (!iterator.EndReached) throw new Error("cursor-limit");
        };
        render();
        observer = new ResizeObserver((entries) => {
          const next = entries[0]?.contentRect.width ?? 0;
          if (Math.abs(next - width) < 2) return;
          width = next;
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            try {
              render();
            } catch {
              if (!cancelled) setError(true);
            }
          }, 120);
        });
        if (container.current) observer.observe(container.current);
      })
      .catch((error: unknown) => {
        console.error("MusicXML engraving failed", error);
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      observer?.disconnect();
      sheet?.cursor?.Dispose();
      sheet?.clear();
      container.current?.replaceChildren();
      marks.current = [];
    };
  }, [document]);
  useEffect(() => {
    for (const mark of marks.current) {
      const active = playing && sourceBeat + 1e-7 >= mark.start && sourceBeat < mark.end - 1e-7;
      if (active === mark.active) continue;
      mark.active = active;
      mark.graph.setColor(active ? "#406a45" : "#202520", { applyToNoteheads: true, applyToStem: true });
      if (mark.element) mark.element.dataset.active = String(active);
    }
  }, [sourceBeat, playing]);
  return (
    <section aria-label={t("ui.score")} className="overflow-x-auto rounded-xl border bg-white p-3 text-black">
      <div ref={container} className="advanced-score min-w-[500px]" />
      {error && <p role="alert">{t("ui.engravingError")}</p>}
    </section>
  );
}
