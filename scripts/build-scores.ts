import { createHash } from "node:crypto";
import { mkdir, readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { SaxesParser } from "saxes";
import { fraction, type MusicDocument } from "../resources/js/music/musicxml";
import { toMidi } from "../resources/js/music/theory";
import type { Pitch } from "../resources/js/types";
import { readMidi } from "./lib/midi";

const root = resolve(import.meta.dir, "..");
const manifest = (await Bun.file(join(root, "scores/manifest.json")).json()) as {
  id: string;
  file: string;
  sha256: string;
  license: string;
  editor: string;
  title: string;
  sourceUrl: string;
  sourceSha256: string;
  part?: string;
  review: string;
}[];
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const toolDir = join(root, "storage/tools");
const binary = process.env.LILYPOND_BIN || join(toolDir, "lilypond-2.26.0/bin/lilypond");
if (!(await Bun.file(binary).exists())) {
  if (process.platform !== "linux" || process.arch !== "x64")
    throw new Error("Set LILYPOND_BIN to LilyPond 2.26.0, or build in the Linux Docker image.");
  await mkdir(toolDir, { recursive: true });
  const archive = join(toolDir, "lilypond-2.26.0.tar.gz");
  const expected = "cd8a097a9f52cb2b9f4e7914774786f203f4fc61fcd299afcbb63c23fa5c6b24";
  let data = (await Bun.file(archive).exists()) ? new Uint8Array(await Bun.file(archive).arrayBuffer()) : null;
  if (!data) {
    const response = await fetch(
      "https://gitlab.com/lilypond/lilypond/-/releases/v2.26.0/downloads/lilypond-2.26.0-linux-x86_64.tar.gz",
      { signal: AbortSignal.timeout(120000) },
    );
    if (!response.ok) throw new Error(`LilyPond download: HTTP ${response.status}`);
    data = new Uint8Array(await response.arrayBuffer());
  }
  if (data.length > 70 * 1024 * 1024 || sha(data) !== expected) throw new Error("LilyPond archive checksum mismatch");
  await Bun.write(archive, data);
  if (await Bun.spawn(["tar", "-xzf", archive, "-C", toolDir], { stdout: "inherit", stderr: "inherit" }).exited)
    throw new Error("Could not extract LilyPond");
}
const version = Bun.spawn([binary, "--version"], { stdout: "pipe", stderr: "pipe" });
if (!(await new Response(version.stdout).text()).startsWith("GNU LilyPond 2.26.0"))
  throw new Error("Use the pinned LilyPond 2.26.0 compiler");
if (await version.exited) throw new Error("LilyPond unavailable");
const includeDrafts = process.argv.includes("--include-drafts");
const output = join(root, includeDrafts ? "storage/review-scores" : "resources/public/generated-scores");
const cache = join(root, "storage/score-build");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await mkdir(cache, { recursive: true });
const fontConfig = join(cache, "fonts.conf");
await Bun.write(
  fontConfig,
  `<?xml version="1.0"?><fontconfig><dir>${join(resolve(binary, "../.."), "share/lilypond/2.26.0/fonts/otf")}</dir><dir>/usr/share/fonts</dir><cachedir>${join(cache, "fonts")}</cachedir></fontconfig>`,
);
const engraver = await Bun.file(join(root, "scores/engraver.ly")).text();
function sanitizeSvg(source: string): string {
  const svg = source.replace(/<a\b[^>]*>/g, "<g>").replace(/<\/a>/g, "</g>");
  const parser = new SaxesParser({ xmlns: false });
  let nodes = 0;
  const allowed = new Set([
    "svg",
    "g",
    "path",
    "rect",
    "line",
    "circle",
    "ellipse",
    "polygon",
    "polyline",
    "text",
    "tspan",
    "defs",
    "use",
    "style",
  ]);
  parser.on("doctype", () => {
    throw new Error("Unexpected SVG DTD");
  });
  parser.on("opentag", (tag) => {
    if (!allowed.has(tag.name) || ++nodes > 100000) throw new Error("Unsafe SVG element");
    for (const [key, value] of Object.entries(tag.attributes)) {
      if (
        /^on/i.test(key) ||
        ((key === "href" || key === "xlink:href") && !String(value).startsWith("#")) ||
        /url\(\s*[^#]/i.test(String(value))
      )
        throw new Error("Unsafe SVG attribute");
    }
  });
  parser.on("text", (text) => {
    if (/@import|javascript:|expression\(/i.test(text)) throw new Error("Unsafe SVG style");
  });
  parser.on("error", () => {
    throw new Error("Malformed SVG");
  });
  parser.write(svg).close();
  return svg;
}
const catalog: Record<
  string,
  { url: string; sha256: string; license: string; editor: string; sourceUrl: string; sourceSha256: string }
> = {};
for (const item of manifest) {
  const source = await Bun.file(join(root, "scores/sources", item.file)).bytes();
  if (sha(source) !== item.sha256) throw new Error(`Source checksum: ${item.id}`);
  if (item.review === "pending" && !includeDrafts) continue;
  const work = join(cache, item.id);
  await mkdir(work, { recursive: true });
  const sourcePath = join(work, "score.ly");
  await Bun.write(sourcePath, source);
  await Bun.write(join(work, "export.ly"), engraver);
  const stamp = join(work, "stamp.json");
  const buildHash = sha(new TextEncoder().encode(item.sha256 + engraver));
  let previous = "";
  try {
    previous = (await Bun.file(stamp).json()).hash;
  } catch {}
  if (previous !== buildHash) {
    for (const name of await readdir(work))
      if (name !== "score.ly" && name !== "export.ly") await rm(join(work, name), { force: true });
    const compiler = Bun.spawn([binary, "--svg", "-dno-point-and-click", "-o", join(work, "score"), sourcePath], {
      cwd: work,
      env: { PATH: Bun.env.PATH ?? "", LANG: "C.UTF-8", FONTCONFIG_FILE: fontConfig, XDG_CACHE_HOME: cache },
      stdout: "pipe",
      stderr: "pipe",
    });
    const log = await new Response(compiler.stderr).text();
    await Bun.write(join(work, "compile.log"), log);
    if (await compiler.exited)
      throw new Error(`Score compilation failed: ${item.id}; see storage/score-build/${item.id}/compile.log`);
    if (/barcheck failed|bar check failed|programming error|fatal error/i.test(log))
      throw new Error(`Musical compiler warning: ${item.id}`);
    await Bun.write(stamp, JSON.stringify({ hash: buildHash }));
  }
  const raw = await Bun.file(join(work, "score.events")).text();
  const ink = raw
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [id, start, duration, midi, step, octave, alter, grace] = line.split("\t");
      const rational = (s: string) => {
        const [n, d] = s.split("/").map(Number);
        return n / (d ?? 1);
      };
      return {
        id,
        grace: grace === "1",
        start: rational(start) * 4,
        end: (rational(start) + rational(duration)) * 4,
        midi: Number(midi),
        pitch: {
          step: ["C", "D", "E", "F", "G", "A", "B"][Number(step)],
          octave: Number(octave),
          alter: Number(alter),
        } as Pitch,
      };
    });
  if (ink.some((n) => !Number.isFinite(n.start) || n.end <= n.start || toMidi(n.pitch) !== n.midi))
    throw new Error(`Invalid engraving events: ${item.id}`);
  const midi = readMidi(await Bun.file(join(work, "score.midi")).bytes());
  const notes: MusicDocument["notes"] = midi.notes.map((note, index) => {
    const start = note.tick / midi.division;
    const match =
      ink.find((n) => !n.grace && n.midi === note.midi && Math.abs(n.start - start) <= 1 / midi.division + 1e-8) ??
      ink
        .filter((n) => n.grace && n.midi === note.midi && Math.abs(n.start - start) <= 0.5)
        .sort((a, b) => Math.abs(a.start - start) - Math.abs(b.start - start))[0];
    if (!match) throw new Error(`MIDI/engraving onset mismatch: ${item.id} MIDI${note.midi} at ${start}`);
    if (match.grace) {
      match.start = start;
      match.end = start + note.length / midi.division;
    }
    return {
      id: `event-${index}`,
      ids: [match.id],
      pitch: match.pitch,
      concert: match.pitch,
      start: fraction(note.tick, midi.division * 4),
      duration: fraction(note.length, midi.division * 4),
      part: `track-${note.track}`,
      voice: "1",
      staff: 1,
      measure: 0,
      velocity: note.velocity,
      tieStart: false,
      tieStop: false,
      articulation: "normal",
    };
  });
  for (const mark of ink) {
    if (
      !midi.notes.some(
        (note) =>
          note.midi === mark.midi &&
          note.tick / midi.division <= mark.start + 1 / midi.division + 1e-8 &&
          (note.tick + note.length) / midi.division > mark.start + 1e-8,
      )
    )
      throw new Error(`Engraved note has no sounding MIDI voice: ${item.id} ${mark.id}`);
  }
  const pages: { url: string; sha256: string }[] = [];
  for (const name of (await readdir(work))
    .filter((name) => /^score(?:-\d+)?\.svg$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) {
    const svg = sanitizeSvg(await Bun.file(join(work, name)).text());
    const filename = `${item.id}-${pages.length + 1}.svg`;
    await Bun.write(join(output, filename), svg);
    pages.push({ url: `/generated-scores/${filename}`, sha256: sha(new TextEncoder().encode(svg)) });
  }
  if (!pages.length || !notes.length) throw new Error(`Empty score: ${item.id}`);
  const doc = {
    title: item.title,
    xml: "",
    realized: true,
    notes,
    measures: [
      {
        start: fraction(0),
        duration: fraction(midi.ticks, midi.division * 4),
        forward: false,
        backward: 0,
        endings: [],
      },
    ],
    parts: new Set(notes.map((n) => n.part)).size,
    issues: [],
    ink,
    pages,
    edition: {
      license: item.license,
      editor: item.editor,
      sourceUrl: item.sourceUrl,
      sourceSha256: item.sourceSha256,
      unfolded: true,
      part: item.part,
      newTranscription: item.editor.includes("transcription"),
    },
  };
  const data = JSON.stringify(doc);
  const filename = `${item.id}.json`;
  await Bun.write(join(output, filename), data);
  catalog[item.id] = {
    url: `/generated-scores/${filename}`,
    sha256: sha(new TextEncoder().encode(data)),
    license: item.license,
    editor: item.editor,
    sourceUrl: item.sourceUrl,
    sourceSha256: item.sourceSha256,
  };
  console.log(`${item.id}: ${notes.length} performed notes, ${pages.length} SVG pages; MIDI/engraving attacks match`);
}
await Bun.write(join(output, "catalog.json"), JSON.stringify(catalog));
