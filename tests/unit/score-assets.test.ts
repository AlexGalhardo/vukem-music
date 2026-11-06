import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import repertoire from "../../resources/js/data/repertoire.json";
import { chordPitches } from "../../resources/js/music/harmony";
import { fraction, measureOrder } from "../../resources/js/music/musicxml";
import { toMidi } from "../../resources/js/music/theory";
import sources from "../../scores/manifest.json";
import { readMidi } from "../../scripts/lib/midi";

test("curated sources are unique, licensed, hashed and mapped to a researched edition", async () => {
  expect(new Set(sources.map((source) => source.id)).size).toBe(sources.length);
  for (const source of sources) {
    const entry = repertoire.find((work) => work.id === source.id);
    if (!entry) throw new Error(`Missing research entry: ${source.id}`);
    expect(source.file).toMatch(/^[a-z0-9-]+\.ly$/);
    expect(source.license).toMatch(/Public Domain|Attribution|MIT/);
    expect(source.sourcePdfSha256).toBe(entry.sourceSha256);
    const bytes = await Bun.file(new URL(`../../scores/sources/${source.file}`, import.meta.url)).bytes();
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(source.sha256);
  }
});

test("ninth inversions keep every voice ascending without losing pitch classes", () => {
  for (const step of ["C", "D", "E", "F", "G", "A", "B"] as const) {
    const root = { step, octave: 4, alter: 0 };
    const base = chordPitches(root, "dominant9")
      .map((p) => toMidi(p) % 12)
      .sort();
    for (let inversion = 0; inversion < 5; inversion++) {
      const midis = chordPitches(root, "dominant9", inversion).map(toMidi);
      expect(midis.every((midi, i) => i === 0 || midi > (midis[i - 1] ?? -Infinity))).toBe(true);
      expect(midis.map((midi) => midi % 12).sort()).toEqual(base);
    }
  }
});

test("nested import repeats fail explicitly before their order can be guessed", () => {
  const bar = (forward: boolean, backward = 0) => ({
    start: fraction(0),
    duration: fraction(1),
    forward,
    backward,
    endings: [],
  });
  expect(() => measureOrder([bar(true), bar(true), bar(false, 2), bar(false, 2)])).toThrow("nested-repeat");
});

function smf(events: number[]) {
  return new Uint8Array([
    77,
    84,
    104,
    100,
    0,
    0,
    0,
    6,
    0,
    0,
    0,
    1,
    0,
    96,
    77,
    84,
    114,
    107,
    0,
    0,
    0,
    events.length,
    ...events,
  ]);
}
test("SMF pairing retains overlapping pitches and running status, and rejects malformed tracks", () => {
  const result = readMidi(smf([0, 0x90, 60, 100, 0, 64, 90, 96, 60, 0, 0, 64, 0, 0, 0xff, 0x2f, 0]));
  expect(result.division).toBe(96);
  expect(result.notes.map((n) => [n.midi, n.tick, n.length])).toEqual([
    [60, 0, 96],
    [64, 0, 96],
  ]);
  expect(() => readMidi(smf([0, 60, 100]))).toThrow("running status");
  expect(() => readMidi(smf([0, 0x90, 60, 100]))).toThrow("held note");
  expect(() => readMidi(smf([0, 0x80, 60, 0]))).toThrow("Unmatched MIDI note off");
  expect(() => readMidi(smf([0, 0x90, 60]))).toThrow("Truncated MIDI");
});
