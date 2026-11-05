import type { Fraction, Locale, Pitch, Score, ScoreEvent } from "../types";

const pitchClasses = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const steps = ["C", "D", "E", "F", "G", "A", "B"] as const;
const ptNames = { C: "Dó", D: "Ré", E: "Mi", F: "Fá", G: "Sol", A: "Lá", B: "Si" };
export function toMidi(pitch: Pitch): number {
  return (pitch.octave + 1) * 12 + pitchClasses[pitch.step] + pitch.alter;
}
export function frequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}
export function pitchAt(midi: number): Pitch {
  const names: Pitch["step"][] = ["C", "C", "D", "D", "E", "F", "F", "G", "G", "A", "A", "B"];
  const pc = ((midi % 12) + 12) % 12;
  return { step: names[pc], octave: Math.floor(midi / 12) - 1, alter: [1, 3, 6, 8, 10].includes(pc) ? 1 : 0 };
}
export function pitchName(pitch: Pitch, locale: Locale): string {
  const accidental = pitch.alter === 1 ? "♯" : pitch.alter === -1 ? "♭" : pitch.alter === 2 ? "𝄪" : "";
  return `${locale === "pt-BR" ? ptNames[pitch.step] : pitch.step}${accidental}${pitch.octave}`;
}
export function diatonic(pitch: Pitch): number {
  return pitch.octave * 7 + steps.indexOf(pitch.step);
}
export function quarterBeats(duration: Fraction): number {
  if (!Number.isInteger(duration.n) || !Number.isInteger(duration.d) || duration.n <= 0 || duration.d <= 0) {
    throw new Error("Invalid rational duration");
  }
  return (duration.n * 4) / duration.d;
}
export function dotted(duration: Fraction, dots: number): Fraction {
  if (!Number.isInteger(dots) || dots < 0 || dots > 4) throw new Error("Invalid dots");
  return { n: duration.n * (2 ** (dots + 1) - 1), d: duration.d * 2 ** dots };
}
export interface TimedEvent {
  event: ScoreEvent;
  start: number;
  end: number;
}
export function timeline(score: Score, bpm: number): TimedEvent[] {
  if (!Number.isFinite(bpm) || bpm < 30 || bpm > 240) throw new Error("Invalid tempo");
  let elapsed = 0;
  return score.events.map((event) => {
    const start = elapsed;
    elapsed += (quarterBeats(event.duration) * 60) / bpm;
    return { event, start, end: elapsed };
  });
}
export function activeAt(events: TimedEvent[], position: number): TimedEvent | undefined {
  return events.find((item) => position >= item.start && position < item.end);
}
export function remaining(events: TimedEvent[], position: number): TimedEvent[] {
  return events
    .filter((item) => item.end > position)
    .map((item) => ({ ...item, start: Math.max(item.start, position) }));
}
export function isBlack(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(midi % 12);
}
export const pianoKeys = Array.from({ length: 88 }, (_, index) => index + 21);
