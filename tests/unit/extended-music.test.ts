import { describe, expect, test } from "bun:test";
import course from "../../resources/js/data/course.json";
import { parseBackup, validBackup } from "../../resources/js/lib/backup";
import { emptyCourse } from "../../resources/js/lib/course-progress";
import { decodeMidi, detectPitch } from "../../resources/js/music/instruments";
import { fraction, importMusicXML, measureOrder, performance } from "../../resources/js/music/musicxml";
import { intervalBetween, matchesPitches, spellScale, voiceLeading } from "../../resources/js/music/semantics";
import { pitchName } from "../../resources/js/music/theory";
import { tunedFrequency } from "../../resources/js/music/tuning";

const c = { step: "C", octave: 4, alter: 0 } as const;
const note = (step: string, octave: number, duration = 4, extra = "") =>
  `<note>${extra}<pitch><step>${step}</step><octave>${octave}</octave></pitch><duration>${duration}</duration><voice>1</voice><type>whole</type></note>`;
const xml = (music: string) =>
  `<score-partwise version="4.0"><part-list><score-part id="p"><part-name>Piano</part-name></score-part></part-list><part id="p">${music}</part></score-partwise>`;
const attributes =
  "<attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>";

describe("bounded musical import and execution", () => {
  test("polyphony, ties, rational tuplets, written/concert pitch and repeats", () => {
    const first = `<measure number="1">${attributes}<attributes><transpose><diatonic>-1</diatonic><chromatic>-2</chromatic></transpose></attributes><barline location="left"><repeat direction="forward"/></barline>${note("C", 5, 4, '<tie type="start"/>')}${note("E", 5, 4, "<chord/>")}</measure>`;
    const second = `<measure number="2">${note("C", 5, 4, '<tie type="stop"/>')}${note("G", 5, 4, "<chord/>")}<barline><repeat direction="backward"/></barline></measure>`;
    const doc = importMusicXML(xml(first + second));
    const result = performance(doc, 60);
    expect(result.order).toEqual([0, 1, 0, 1]);
    expect(result.total).toBe(16);
    expect(result.events[0].midi).toBe(70);
    expect(result.events[0].end).toBe(8);
    expect(result.events[0].ids).toHaveLength(2);
    expect(result.events.filter((n) => n.start === 0)).toHaveLength(2);
    expect(result.events[0].pitch.step).toBe("C");
    const triplet = importMusicXML(
      xml(
        `<measure implicit="yes"><attributes><divisions>3</divisions></attributes>${note("C", 4, 1)}${note("D", 4, 1)}${note("E", 4, 1)}</measure>`,
      ),
    );
    expect(triplet.notes[0].duration).toEqual({ n: 1, d: 12 });
    expect(performance(triplet, 60).total).toBe(1);
  });
  test("unsafe XML and unsupported notation cannot silently become audio", () => {
    expect(() =>
      importMusicXML('<!DOCTYPE score-partwise [<!ENTITY x SYSTEM "file:///etc/passwd">]><score-partwise/>'),
    ).toThrow("xml-dtd");
    expect(() => importMusicXML('<score-partwise><image source="https://example.com/x"/></score-partwise>')).toThrow(
      "xml-external",
    );
    expect(() => importMusicXML("<score-partwise>")).toThrow("xml-malformed");
    expect(() => importMusicXML("x".repeat(2 * 1024 * 1024 + 1))).toThrow("xml-size");
    const jumps = importMusicXML(
      xml(`<measure>${attributes}<direction><sound dacapo="yes"/></direction>${note("C", 4)}</measure>`),
    );
    expect(jumps.issues).toContainEqual({ code: "jumps", severity: "error" });
    expect(() => performance(jumps, 80)).toThrow("unsupported-score");
    const tie = importMusicXML(xml(`<measure>${attributes}${note("C", 4, 4, '<tie type="stop"/>')}</measure>`));
    expect(() => performance(tie, 80)).toThrow("tie-mismatch");
  });
  test("first and second endings have bounded distinct traversal", () => {
    const bar = (forward = false, backward = 0, endings: number[] = []) => ({
      start: fraction(0),
      duration: fraction(1),
      forward,
      backward,
      endings,
    });
    expect(measureOrder([bar(true), bar(false, 2, [1]), bar(false, 0, [2]), bar()])).toEqual([0, 1, 0, 2, 3]);
  });
});

test("musical semantic evaluators preserve spelling and contextual rules", () => {
  expect(intervalBetween(c, { step: "F", octave: 4, alter: 1 })).toEqual({
    number: 4,
    semitones: 6,
    quality: "augmented",
  });
  expect(intervalBetween(c, { step: "G", octave: 4, alter: -1 })).toEqual({
    number: 5,
    semitones: 6,
    quality: "diminished",
  });
  expect(intervalBetween(c, { step: "D", octave: 5, alter: 0 })).toEqual({
    number: 9,
    semitones: 14,
    quality: "major",
  });
  expect(spellScale({ step: "G", octave: 4, alter: 0 }, "major").map((p) => pitchName(p, "en"))).toEqual([
    "G4",
    "A4",
    "B4",
    "C5",
    "D5",
    "E5",
    "F♯5",
  ]);
  expect(
    matchesPitches("Dó Mi♭ Sol", [c, { step: "E", octave: 4, alter: -1 }, { step: "G", octave: 4, alter: 0 }]),
  ).toBe(true);
  expect(matchesPitches("C D# G", [c, { step: "E", octave: 4, alter: -1 }, { step: "G", octave: 4, alter: 0 }])).toBe(
    false,
  );
  expect(
    matchesPitches("C D# G", [c, { step: "E", octave: 4, alter: -1 }, { step: "G", octave: 4, alter: 0 }], {
      enharmonic: true,
    }),
  ).toBe(true);
  expect(
    voiceLeading(
      [c, { step: "G", octave: 4, alter: 0 }],
      [
        { step: "D", octave: 4, alter: 0 },
        { step: "A", octave: 4, alter: 0 },
      ],
    ).parallelPerfect,
  ).toBe(true);
  expect(tunedFrequency(64, "just-c") / tunedFrequency(60, "just-c")).toBeCloseTo(1.25, 8);
  expect(tunedFrequency(69, "equal")).toBe(440);
});

test("MIDI events and monophonic estimates are conservative", () => {
  expect(decodeMidi(new Uint8Array([0x91, 60, 0]))?.type).toBe("off");
  expect(decodeMidi(new Uint8Array([0xb2, 64, 127]))).toMatchObject({ type: "pedal", channel: 2, down: true });
  expect(decodeMidi(new Uint8Array([0xb0, 123, 0]))?.type).toBe("reset");
  expect(decodeMidi(new Uint8Array([0x90, 60]))).toBeNull();
  expect(detectPitch(new Float32Array(4096), 48000)).toBeNull();
  const tone = Float32Array.from({ length: 4096 }, (_, i) => 0.3 * Math.sin((2 * Math.PI * 440 * i) / 48000));
  const detected = detectPitch(tone, 48000);
  expect(detected?.midi).toBe(69);
  expect(Math.abs(detected?.cents ?? 100)).toBeLessThan(3);
  expect(detected?.confidence).toBeGreaterThan(0.95);
});

test("all 58 chapter topics are bilingual and backups reject corrupt progress", () => {
  expect(course).toHaveLength(58);
  expect(new Set(course.map((c) => c.chapter)).size).toBe(58);
  for (const topic of course) {
    for (const lang of ["en", "pt-BR"] as const) {
      expect(topic.body[lang].length).toBeGreaterThan(100);
      expect(topic.options[lang]).toHaveLength(3);
      expect(topic.correct).toBeLessThan(3);
    }
  }
  const backup = {
    version: 1,
    foundation: { version: 1, completed: [], attempts: 0, correct: 0 },
    course: emptyCourse(),
  };
  expect(validBackup(backup)).toBe(true);
  expect(validBackup({ ...backup, course: { ...emptyCourse(), correct: 3 } })).toBe(false);
  expect(() => parseBackup('{"version":42}')).toThrow();
  expect(() => parseBackup("x".repeat(65537))).toThrow();
});

test("microphone rejects deterministic broadband noise and estimates a harmonic tone without grading it", () => {
  let seed = 123456;
  const noise = Float32Array.from({ length: 4096 }, () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return ((seed / 4294967296) * 2 - 1) * 0.15;
  });
  expect(detectPitch(noise, 48000)).toBeNull();
  const harmonic = Float32Array.from(
    { length: 4096 },
    (_, i) => 0.2 * Math.sin((2 * Math.PI * 220 * i) / 48000) + 0.08 * Math.sin((2 * Math.PI * 440 * i) / 48000),
  );
  const estimate = detectPitch(harmonic, 48000);
  expect(estimate?.midi).toBe(57);
  expect(estimate?.confidence).toBeGreaterThan(0.9);
});
