import { SaxesParser } from "saxes";
import type { Fraction, Pitch } from "../types";
import { quarterBeats, toMidi } from "./theory";

export interface XmlNode {
  name: string;
  attrs: Record<string, string>;
  text: string;
  children: XmlNode[];
}
export interface PerformanceNote {
  id: string;
  ids: string[];
  pitch: Pitch;
  concert: Pitch;
  start: Fraction;
  duration: Fraction;
  part: string;
  voice: string;
  staff: number;
  measure: number;
  velocity: number;
  tieStart: boolean;
  tieStop: boolean;
  articulation: "normal" | "staccato" | "tenuto";
}
export interface ScoreIssue {
  code: string;
  severity: "warning" | "error";
}
export interface PerformanceMeasure {
  start: Fraction;
  duration: Fraction;
  forward: boolean;
  backward: number;
  endings: number[];
}
export interface MusicDocument {
  realized?: boolean;
  title: string;
  xml: string;
  notes: PerformanceNote[];
  measures: PerformanceMeasure[];
  issues: ScoreIssue[];
  parts: number;
}
export const fraction = (n: number, d = 1): Fraction => {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d <= 0) throw new Error("Invalid rational");
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const g = gcd(Math.abs(n), d) || 1;
  return { n: n / g, d: d / g };
};
export const add = (a: Fraction, b: Fraction) => fraction(a.n * b.d + b.n * a.d, a.d * b.d);
export const compare = (a: Fraction, b: Fraction) => a.n * b.d - b.n * a.d;
export const beats = (a: Fraction) => (a.n * 4) / a.d;
const child = (n: XmlNode, name: string) => n.children.find((c) => c.name === name);
const children = (n: XmlNode, name: string) => n.children.filter((c) => c.name === name);
const text = (n: XmlNode | undefined) => n?.text.trim() ?? "";
const value = (n: XmlNode, name: string) => text(child(n, name));
const number = (s: string, fallback: number) => (s === "" ? fallback : Number(s));
const steps = ["C", "D", "E", "F", "G", "A", "B"] as const;
function shiftPitch(p: Pitch, diatonic: number, chromatic: number): Pitch {
  const position = p.octave * 7 + steps.indexOf(p.step) + diatonic;
  const natural: Pitch = { step: steps[((position % 7) + 7) % 7], octave: Math.floor(position / 7), alter: 0 };
  return { ...natural, alter: toMidi(p) + chromatic - toMidi(natural) };
}

/** A bounded tree without DTDs, entity resolution, URLs, or parser recovery. */
export function readXml(source: string): XmlNode {
  if (new TextEncoder().encode(source).length > 2 * 1024 * 1024) throw new Error("xml-size");
  if (/<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error("xml-dtd");
  const parser = new SaxesParser({ xmlns: false });
  const stack: XmlNode[] = [];
  let root: XmlNode | undefined;
  let count = 0;
  parser.on("doctype", () => {
    throw new Error("xml-dtd");
  });
  parser.on("opentag", (tag) => {
    if (++count > 100000 || stack.length >= 64) throw new Error("xml-complexity");
    const attrs = tag.attributes as Record<string, string>;
    if (Object.keys(attrs).some((key) => /href|src/i.test(key)) || ["image", "credit-image", "link"].includes(tag.name))
      throw new Error("xml-external");
    const node: XmlNode = { name: tag.name, attrs, text: "", children: [] };
    if (stack.length) stack[stack.length - 1].children.push(node);
    else root = node;
    stack.push(node);
  });
  const append = (s: string) => {
    if (stack.length) stack[stack.length - 1].text += s;
  };
  parser.on("text", append);
  parser.on("cdata", append);
  parser.on("closetag", () => {
    stack.pop();
  });
  parser.on("error", () => {
    throw new Error("xml-malformed");
  });
  try {
    parser.write(source).close();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("xml-")) throw error;
    throw new Error("xml-malformed");
  }
  if (root?.name !== "score-partwise") throw new Error("xml-root");
  return root;
}

export function importMusicXML(xml: string): MusicDocument {
  const root = readXml(xml);
  const notes: PerformanceNote[] = [];
  const issues: ScoreIssue[] = [];
  const measures: PerformanceMeasure[] = [];
  const issue = (code: string, severity: ScoreIssue["severity"] = "error") => {
    if (!issues.some((i) => i.code === code)) issues.push({ code, severity });
  };
  const parts = children(root, "part");
  if (!parts.length || parts.length > 16) throw new Error("xml-parts");
  let noteCounter = 0;
  for (const [partIndex, part] of parts.entries()) {
    let divisions = 1;
    let meter: Fraction = fraction(1);
    let origin = fraction(0);
    let transD = 0;
    let transC = 0;
    let velocity = 0.7;
    const bars = children(part, "measure");
    if (!bars.length || bars.length > 512) throw new Error("xml-measures");
    let ending: number[] = [];
    for (const [measureIndex, bar] of bars.entries()) {
      let cursor = fraction(0);
      let extent = fraction(0);
      let lastStart = fraction(0);
      let canChord = false;
      let forward = false;
      let backward = 0;
      let currentEnding = [...ending];
      for (const item of bar.children) {
        if (item.name === "attributes") {
          if (child(item, "divisions")) {
            divisions = Number(value(item, "divisions"));
            if (!Number.isSafeInteger(divisions) || divisions < 1 || divisions > 100000)
              throw new Error("xml-divisions");
          }
          const time = child(item, "time");
          if (time) {
            const n = value(time, "beats")
              .split("+")
              .reduce((sum, x) => sum + Number(x), 0);
            const d = Number(value(time, "beat-type"));
            if (!Number.isInteger(n) || n < 1 || n > 32 || ![1, 2, 4, 8, 16, 32, 64].includes(d))
              throw new Error("xml-meter");
            meter = fraction(n, d);
          }
          if (children(item, "time").length > 1) issue("polymeter");
          const transpose = child(item, "transpose");
          if (transpose) {
            const oct = number(value(transpose, "octave-change"), 0);
            transD = number(value(transpose, "diatonic"), 0) + oct * 7;
            transC = number(value(transpose, "chromatic"), 0) + oct * 12;
            if (!Number.isInteger(transD) || !Number.isInteger(transC) || Math.abs(transC) > 48)
              throw new Error("xml-transpose");
          }
        }
        if (item.name === "direction") {
          const sound = child(item, "sound");
          if (sound) {
            if (
              Object.keys(sound.attrs).some((k) =>
                ["dacapo", "dalsegno", "tocoda", "fine", "segno", "coda"].includes(k),
              )
            )
              issue("jumps");
            if (sound.attrs.tempo) issue("practice-tempo", "warning");
            if (sound.attrs.dynamics) {
              const d = Number(sound.attrs.dynamics);
              if (!Number.isFinite(d) || d < 0 || d > 200) throw new Error("xml-dynamics");
              velocity = Math.min(1, Math.max(0.05, (d / 100) * 0.7));
            }
          }
          const direction = child(item, "direction-type");
          if (direction?.children.some((n) => ["pedal", "wedge"].includes(n.name)))
            issue("expression-playback", "warning");
          if (direction?.children.some((n) => n.name === "octave-shift")) issue("octave-shift");
        }
        if (item.name === "backup" || item.name === "forward") {
          canChord = false;
          const amount = Number(value(item, "duration"));
          if (!Number.isSafeInteger(amount) || amount <= 0 || amount / divisions > 256) throw new Error("xml-duration");
          cursor = add(cursor, fraction((item.name === "backup" ? -1 : 1) * amount, 4 * divisions));
          if (cursor.n < 0) throw new Error("xml-backup");
          if (compare(cursor, extent) > 0) extent = cursor;
        }
        if (item.name === "barline") {
          const repeat = child(item, "repeat");
          if (repeat?.attrs.direction === "forward") forward = true;
          if (repeat?.attrs.direction === "backward") {
            backward = number(repeat.attrs.times ?? "", 2);
            if (!Number.isInteger(backward) || backward < 2 || backward > 4) throw new Error("xml-repeat");
          }
          const e = child(item, "ending");
          if (e) {
            const nums = (e.attrs.number ?? "").split(",").map(Number);
            if (nums.some((n) => !Number.isInteger(n) || n < 1 || n > 4)) issue("ending-number");
            if (e.attrs.type === "start") {
              ending = nums;
              currentEnding = nums;
            } else ending = [];
          }
        }
        if (item.name !== "note") continue;
        if (++noteCounter > 50000) throw new Error("xml-notes");
        if (child(item, "grace")) {
          issue("grace-playback");
          continue;
        }
        const ticks = Number(value(item, "duration"));
        if (!Number.isSafeInteger(ticks) || ticks <= 0 || ticks / divisions > 256) throw new Error("xml-duration");
        const duration = fraction(ticks, 4 * divisions);
        const isChord = !!child(item, "chord");
        if (isChord && !canChord) throw new Error("xml-chord");
        canChord = !!child(item, "pitch");
        const onset = isChord ? lastStart : cursor;
        if (!isChord) {
          lastStart = cursor;
          cursor = add(cursor, duration);
        }
        const end = add(onset, duration);
        if (compare(end, extent) > 0) extent = end;
        const node = child(item, "pitch");
        if (child(item, "unpitched")) issue("unpitched");
        if (!node) continue;
        const step = value(node, "step");
        const octave = Number(value(node, "octave"));
        const alter = number(value(node, "alter"), 0);
        if (
          !steps.includes(step as Pitch["step"]) ||
          !Number.isInteger(octave) ||
          octave < 0 ||
          octave > 8 ||
          !Number.isInteger(alter) ||
          Math.abs(alter) > 2
        )
          throw new Error("xml-pitch");
        const pitch: Pitch = { step: step as Pitch["step"], octave, alter };
        const concert = shiftPitch(pitch, transD, transC);
        if (toMidi(concert) < 21 || toMidi(concert) > 108) issue("piano-range");
        const notation = child(item, "notations");
        if (notation?.children.some((n) => ["ornaments", "glissando", "slide", "technical"].includes(n.name)))
          issue("ornament-playback", "warning");
        const ties = new Set(children(item, "tie").map((tie) => tie.attrs.type));
        if (!ties.size && notation) for (const tied of children(notation, "tied")) ties.add(tied.attrs.type);
        const articulations = notation && child(notation, "articulations");
        const id = `p${partIndex}-m${measureIndex}-n${noteCounter}`;
        notes.push({
          id,
          ids: [id],
          pitch,
          concert,
          start: add(origin, onset),
          duration,
          part: part.attrs.id ?? String(partIndex),
          voice: value(item, "voice") || "1",
          staff: number(value(item, "staff"), 1),
          measure: measureIndex,
          velocity,
          tieStart: ties.has("start"),
          tieStop: ties.has("stop"),
          articulation:
            articulations && child(articulations, "staccato")
              ? "staccato"
              : articulations && child(articulations, "tenuto")
                ? "tenuto"
                : "normal",
        });
      }
      if (extent.n <= 0) extent = meter;
      if (compare(extent, meter) !== 0 && bar.attrs.implicit !== "yes") issue("measure-duration", "warning");
      if (partIndex === 0)
        measures.push({ start: origin, duration: extent, forward, backward, endings: currentEnding });
      else if (
        !measures[measureIndex] ||
        compare(measures[measureIndex].start, origin) !== 0 ||
        compare(measures[measureIndex].duration, extent) !== 0
      )
        issue("part-alignment");
      origin = add(origin, extent);
    }
    if (bars.length !== measures.length) issue("part-alignment");
  }
  return {
    xml,
    title: text(child(root, "movement-title")) || value(child(root, "work") ?? root, "work-title") || "MusicXML",
    notes,
    measures,
    issues,
    parts: parts.length,
  };
}

/** Bound every repeated traversal; ending passes refer to their nearest repeat. */
export function measureOrder(measures: PerformanceMeasure[]): number[] {
  const order: number[] = [];
  const counts = new Map<number, number>();
  let start = 0;
  let index = 0;
  let pass = 1;
  let stepsTaken = 0;
  const forwardStack: number[] = [];
  while (index < measures.length) {
    if (++stepsTaken > 4096) throw new Error("repeat-limit");
    const bar = measures[index];
    if (bar.forward && forwardStack.at(-1) !== index) {
      // Nested repeats need an independent pass stack; do not guess their order.
      if (forwardStack.length) throw new Error("nested-repeat");
      forwardStack.push(index);
      start = index;
    }
    const included = !bar.endings.length || bar.endings.includes(pass);
    if (included) order.push(index);
    if (bar.backward) {
      const count = (counts.get(index) ?? 0) + 1;
      counts.set(index, count);
      if (included && count < bar.backward) {
        pass = count + 1;
        index = forwardStack.at(-1) ?? start;
        continue;
      }
      forwardStack.pop();
      start = forwardStack.at(-1) ?? 0;
      pass = count;
    }
    index++;
    // A new ordinary bar after an ending resumes first-pass semantics.
    if (index < measures.length && !measures[index].endings.length && !measures[index].backward && !forwardStack.length)
      pass = 1;
  }
  return order;
}
export interface SoundEvent {
  id: string;
  ids: string[];
  midi: number;
  pitch: Pitch;
  start: number;
  end: number;
  sourceBeat: number;
  velocity: number;
}
export function performance(
  document: MusicDocument,
  bpm: number,
  transpose = 0,
): {
  events: SoundEvent[];
  total: number;
  order: number[];
  segments: { start: number; end: number; sourceBeat: number }[];
} {
  if (document.issues.some((i) => i.severity === "error")) throw new Error("unsupported-score");
  if (!Number.isFinite(bpm) || bpm < 20 || bpm > 300 || !Number.isInteger(transpose) || Math.abs(transpose) > 24)
    throw new Error("performance-options");
  const order = measureOrder(document.measures);
  const events: SoundEvent[] = [];
  const segments: { start: number; end: number; sourceBeat: number }[] = [];
  let elapsed = 0;
  const openTies = new Map<string, SoundEvent>();
  for (const [visit, index] of order.entries()) {
    const bar = document.measures[index];
    const startBeat = beats(bar.start);
    const span = (quarterBeats(bar.duration) * 60) / bpm;
    segments.push({ start: elapsed, end: elapsed + span, sourceBeat: startBeat });
    for (const note of document.notes.filter((n) => n.measure === index)) {
      const midi = toMidi(note.concert) + transpose;
      if (midi < 21 || midi > 108) throw new Error("piano-range");
      const start = elapsed + ((beats(note.start) - startBeat) * 60) / bpm;
      const duration = (quarterBeats(note.duration) * 60) / bpm;
      const key = `${note.part}:${note.voice}:${note.staff}:${midi}`;
      const tied = openTies.get(key);
      if (note.tieStop) {
        if (!tied || Math.abs(tied.end - start) > 1e-7) throw new Error("tie-mismatch");
        tied.end = start + duration;
        tied.ids.push(note.id);
        if (!note.tieStart) openTies.delete(key);
      } else {
        if (openTies.has(key)) throw new Error("tie-mismatch");
        const event: SoundEvent = {
          id: `${note.id}-v${visit}`,
          ids: [note.id],
          midi,
          pitch: note.pitch,
          start,
          end: start + duration * (document.realized ? 1 : note.articulation === "staccato" ? 0.5 : 0.98),
          sourceBeat: beats(note.start),
          velocity: note.velocity,
        };
        if (note.tieStart) {
          event.end = start + duration;
          openTies.set(key, event);
        }
        events.push(event);
      }
    }
    elapsed += span;
    if (elapsed > 3600 || events.length > 100000) throw new Error("performance-limit");
  }
  if (openTies.size) throw new Error("tie-mismatch");
  const edges = events
    .flatMap((event) => [
      { time: event.start, count: 1 },
      { time: event.end, count: -1 },
    ])
    .sort((a, b) => a.time - b.time || a.count - b.count);
  let voices = 0;
  for (const edge of edges) {
    voices += edge.count;
    if (voices > 32) throw new Error("polyphony-limit");
  }

  return { events: events.sort((a, b) => a.start - b.start), total: elapsed, order, segments };
}
