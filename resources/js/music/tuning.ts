import { frequency } from "./theory";
export type Tuning = "equal" | "just-c" | "pythagorean-c";
const just = [1, 16 / 15, 9 / 8, 6 / 5, 5 / 4, 4 / 3, 45 / 32, 3 / 2, 8 / 5, 5 / 3, 9 / 5, 15 / 8];
const pythagorean = [
  1,
  256 / 243,
  9 / 8,
  32 / 27,
  81 / 64,
  4 / 3,
  729 / 512,
  3 / 2,
  128 / 81,
  27 / 16,
  16 / 9,
  243 / 128,
];
/** Fixed-C historical demonstrations, not adaptive tuning for arbitrary keys. */
export function tunedFrequency(midi: number, tuning: Tuning): number {
  if (tuning === "equal") return frequency(midi);
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 5;
  return frequency(60) * (tuning === "just-c" ? just : pythagorean)[pc] * 2 ** octave;
}
