import { describe, expect, test } from "bun:test";
import lessons from "../../app/curriculum/lessons.json";
import {
  activeAt,
  dotted,
  frequency,
  pianoKeys,
  pitchAt,
  pitchName,
  quarterBeats,
  remaining,
  timeline,
  toMidi,
} from "../../resources/js/music/theory";
import type { Lesson } from "../../resources/js/types";

describe("musical invariants", () => {
  test("scientific pitches, piano boundaries and enharmonic spelling", () => {
    expect(frequency(69)).toBe(440);
    expect(frequency(60)).toBeCloseTo(261.625565, 5);
    expect(frequency(21)).toBeCloseTo(27.5);
    expect(pianoKeys.length).toBe(88);
    expect(pianoKeys.at(-1)).toBe(108);
    const cs = { step: "C", octave: 4, alter: 1 } as const;
    const db = { step: "D", octave: 4, alter: -1 } as const;
    expect(toMidi(cs)).toBe(toMidi(db));
    expect(pitchName(cs, "en")).not.toBe(pitchName(db, "en"));
    expect(pitchName(pitchAt(60), "pt-BR")).toBe("Dó4");
  });
  test("rational durations and augmentation dots", () => {
    expect(quarterBeats({ n: 1, d: 8 })).toBe(0.5);
    expect(quarterBeats(dotted({ n: 1, d: 2 }, 1))).toBe(3);
    expect(quarterBeats(dotted({ n: 1, d: 4 }, 2))).toBe(1.75);
    expect(() => quarterBeats({ n: 1, d: 0 })).toThrow();
  });
  test("every bilingual study is exactly two complete measures", () => {
    for (const lesson of lessons as Lesson[]) {
      expect(lesson.body.en.length).toBeGreaterThan(1);
      expect(lesson.body["pt-BR"].length).toBe(lesson.body.en.length);
      const events = timeline(lesson.score, 60);
      expect(events.at(-1)?.end).toBe(8);
      for (const event of events) if (event.event.pitch) expect(toMidi(event.event.pitch)).toBeGreaterThanOrEqual(21);
    }
  });
  test("audio clock boundaries include rests and tempo changes", () => {
    const lesson = (lessons as Lesson[]).find((item) => item.id === "rhythm-and-rests");
    if (!lesson) throw new Error("Fixture missing");
    const events = timeline(lesson.score, 60);
    expect(activeAt(events, 0)?.event.pitch?.step).toBe("C");
    expect(activeAt(events, 2)?.event.pitch).toBeNull();
    expect(activeAt(events, 8)).toBeUndefined();
    expect(timeline(lesson.score, 120).at(-1)?.end).toBe(4);
    expect(() => timeline(lesson.score, 0)).toThrow();
  });
  test("resuming a sustained note keeps its original end and following events", () => {
    const events = timeline((lessons as Lesson[])[0].score, 60);
    const resumed = remaining(events, 0.4);
    expect(resumed[0].start).toBe(0.4);
    expect(resumed[0].end).toBe(1);
    expect(resumed[1].start).toBe(1);
    expect(remaining(events, 8)).toEqual([]);
  });
});
