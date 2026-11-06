import { describe, expect, test } from "bun:test";
import repertoire from "../../resources/js/data/repertoire.json";
import { chordPitches } from "../../resources/js/music/harmony";
import { pitchName, toMidi } from "../../resources/js/music/theory";
import sources from "../../scores/manifest.json";

const c = { step: "C", octave: 4, alter: 0 } as const;
describe("chord spelling and inversion", () => {
  test("inversion moves bass without changing the root or pitch classes", () => {
    expect(chordPitches(c, "major").map(toMidi)).toEqual([60, 64, 67]);
    expect(chordPitches(c, "major", 1).map(toMidi)).toEqual([64, 67, 72]);
    expect(chordPitches(c, "major", 2).map(toMidi)).toEqual([67, 72, 76]);
    expect(chordPitches(c, "dominant7", 3).map(toMidi)).toEqual([70, 72, 76, 79]);
    expect(() => chordPitches(c, "minor", 3)).toThrow();
  });
  test("enharmonic sound preserves the written seventh, including double flats", () => {
    const chord = chordPitches(c, "diminished7");
    expect(chord.map(toMidi)).toEqual([60, 63, 66, 69]);
    expect(chord.map((pitch) => pitchName(pitch, "en"))).toEqual(["C4", "E♭4", "G♭4", "B𝄫4"]);
    expect(pitchName(chord[3], "pt-BR")).toBe("Si𝄫4");
    expect(chordPitches({ step: "B", octave: 4, alter: 0 }, "major").map((pitch) => pitchName(pitch, "en"))).toEqual([
      "B4",
      "D♯5",
      "F♯5",
    ]);
  });
});

test("50 distinct, attributed, bilingual works retain edition provenance", () => {
  expect(repertoire).toHaveLength(50);
  expect(new Set(repertoire.map((work) => work.id)).size).toBe(50);
  expect(repertoire.filter((work) => work.composer === "Christian Petzold")).toHaveLength(2);
  for (const work of repertoire) {
    expect(work.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(work.downloadSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(work.pdfUrl).toMatch(/^https:\/\//);
    expect(work.sourceUrl).toMatch(/^https:\/\//);
    expect(work.license).toMatch(/Public Domain|Creative Commons Attribution-ShareAlike/);
    expect(work.title.en.length).toBeGreaterThan(0);
    expect(work.title["pt-BR"].length).toBeGreaterThan(0);
    expect(work.level).toBeGreaterThanOrEqual(0);
    expect(work.level).toBeLessThanOrEqual(3);
    expect(work.playbackReady).toBe(sources.some((source) => source.id === work.id && source.review !== "pending"));
    for (const page of work.pages) expect(page).toBeGreaterThan(0);
  }
});
