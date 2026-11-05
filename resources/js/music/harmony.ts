import type { Pitch } from "../types";
import { toMidi } from "./theory";

export const qualities = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  dominant7: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  halfDiminished7: [0, 3, 6, 10],
  diminished7: [0, 3, 6, 9],
} as const;
export type ChordQuality = keyof typeof qualities;
export const rootSteps = ["C", "D", "E", "F", "G", "A", "B"] as const;

/** Spell stacked thirds before rotating voices; chord root is independent of bass. */
export function chordPitches(root: Pitch, quality: ChordQuality, inversion = 0): Pitch[] {
  const intervals = qualities[quality];
  if (!intervals || !Number.isInteger(inversion) || inversion < 0 || inversion >= intervals.length)
    throw new Error("Invalid chord or inversion");
  const start = rootSteps.indexOf(root.step);
  const pitches = intervals.map((interval, index) => {
    const position = start + index * 2;
    const natural: Pitch = {
      step: rootSteps[position % 7],
      octave: root.octave + Math.floor(position / 7),
      alter: 0,
    };
    return { ...natural, alter: toMidi(root) + interval - toMidi(natural) };
  });
  return [
    ...pitches.slice(inversion),
    ...pitches.slice(0, inversion).map((pitch) => ({ ...pitch, octave: pitch.octave + 1 })),
  ];
}
