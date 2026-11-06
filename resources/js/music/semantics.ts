import type { Pitch } from "../types";
import { rootSteps } from "./harmony";
import { diatonic, toMidi } from "./theory";

export const modes = {
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinorAscending: [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  wholeTone: [0, 2, 4, 6, 8, 10],
  majorPentatonic: [0, 2, 4, 7, 9],
} as const;
export type ScaleMode = keyof typeof modes;
export function spellScale(root: Pitch, mode: ScaleMode): Pitch[] {
  const intervals = modes[mode];
  const degrees = mode === "majorPentatonic" ? [0, 1, 2, 4, 5] : intervals.map((_, i) => i);
  const first = rootSteps.indexOf(root.step);
  return intervals.map((interval, index) => {
    const position = first + degrees[index];
    const natural: Pitch = { step: rootSteps[position % 7], octave: root.octave + Math.floor(position / 7), alter: 0 };
    return { ...natural, alter: toMidi(root) + interval - toMidi(natural) };
  });
}
export type IntervalQuality =
  | "perfect"
  | "major"
  | "minor"
  | "augmented"
  | "diminished"
  | "doublyAugmented"
  | "doublyDiminished";
export function intervalBetween(a: Pitch, b: Pitch): { number: number; semitones: number; quality: IntervalQuality } {
  const distance = diatonic(b) - diatonic(a);
  if (distance < 0 || toMidi(b) < toMidi(a)) throw new Error("Use ascending written intervals");
  const number = distance + 1;
  const simple = (number - 1) % 7;
  const octaves = Math.floor((number - 1) / 7);
  const baseline = [0, 2, 4, 5, 7, 9, 11][simple] + octaves * 12;
  const delta = toMidi(b) - toMidi(a) - baseline;
  const perfect = [0, 3, 4].includes(simple);
  const quality: IntervalQuality | undefined = perfect
    ? ({ 0: "perfect", 1: "augmented", 2: "doublyAugmented", [-1]: "diminished", [-2]: "doublyDiminished" } as const)[
        delta
      ]
    : (
        {
          0: "major",
          [-1]: "minor",
          1: "augmented",
          2: "doublyAugmented",
          [-2]: "diminished",
          [-3]: "doublyDiminished",
        } as const
      )[delta];
  if (!quality) throw new Error("Interval quality exceeds supported alterations");
  return { number, semitones: toMidi(b) - toMidi(a), quality };
}
const names: Record<string, Pitch["step"]> = {
  c: "C",
  d: "D",
  e: "E",
  f: "F",
  g: "G",
  a: "A",
  b: "B",
  do: "C",
  re: "D",
  mi: "E",
  fa: "F",
  sol: "G",
  la: "A",
  si: "B",
};
export function parsePitchList(input: string): Pitch[] | null {
  const tokens = input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .split(/[\s,;–]+/)
    .filter(Boolean);
  if (!tokens.length || tokens.length > 16) return null;
  const result: Pitch[] = [];
  for (const token of tokens) {
    const match = /^(sol|do|re|mi|fa|la|si|[a-g])(bb|##|𝄫|𝄪|♭|♯|b|#)?([0-8])?$/i.exec(token);
    if (!match) return null;
    const accidental = match[2] ?? "";
    result.push({
      step: names[match[1].toLowerCase()],
      alter: ["bb", "𝄫"].includes(accidental)
        ? -2
        : ["##", "𝄪"].includes(accidental)
          ? 2
          : ["b", "♭"].includes(accidental)
            ? -1
            : ["#", "♯"].includes(accidental)
              ? 1
              : 0,
      octave: Number(match[3] ?? 4),
    });
  }
  return result;
}
/** Construction questions require spelling; sonic-equivalence questions opt in. */
export function matchesPitches(
  input: string,
  expected: Pitch[],
  options: { enharmonic?: boolean; ordered?: boolean; octave?: boolean } = {},
): boolean {
  const pitches = parsePitchList(input);
  if (!pitches || pitches.length !== expected.length) return false;
  const key = (p: Pitch) =>
    options.enharmonic
      ? String(options.octave ? toMidi(p) : ((toMidi(p) % 12) + 12) % 12)
      : `${p.step}:${p.alter}${options.octave ? `:${p.octave}` : ""}`;
  const actual = pitches.map(key);
  const answer = expected.map(key);
  if (!options.ordered) {
    actual.sort();
    answer.sort();
  }
  return actual.every((p, i) => p === answer[i]);
}
export interface VoiceLeadingResult {
  common: number;
  motions: number[];
  parallelPerfect: boolean;
}
/** A common-practice classroom criterion, never a universal ban on parallel motion. */
export function voiceLeading(from: Pitch[], to: Pitch[]): VoiceLeadingResult {
  if (from.length !== to.length || from.length < 2 || from.length > 8) throw new Error("Match the same voices");
  const motions = from.map((p, i) => toMidi(to[i]) - toMidi(p));
  let parallelPerfect = false;
  for (let i = 0; i < from.length; i++)
    for (let j = i + 1; j < from.length; j++) {
      const a = Math.abs(toMidi(from[i]) - toMidi(from[j])) % 12;
      const b = Math.abs(toMidi(to[i]) - toMidi(to[j])) % 12;
      if ([0, 7].includes(a) && a === b && motions[i] !== 0 && Math.sign(motions[i]) === Math.sign(motions[j]))
        parallelPerfect = true;
    }
  return { common: motions.filter((m) => m === 0).length, motions, parallelPerfect };
}
