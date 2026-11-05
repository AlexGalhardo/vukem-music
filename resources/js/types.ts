export type Locale = "en" | "pt-BR";
export type Localized<T = string> = Record<Locale, T>;
export interface Pitch {
  step: "C" | "D" | "E" | "F" | "G" | "A" | "B";
  octave: number;
  alter: number;
}
export interface Fraction {
  n: number;
  d: number;
}
export interface ScoreEvent {
  id: string;
  pitch: Pitch | null;
  duration: Fraction;
}
export interface Score {
  id: string;
  clef: "treble" | "bass";
  meter: [number, number];
  events: ScoreEvent[];
}
export interface Lesson {
  id: string;
  order: number;
  minutes: number;
  chapter: number;
  title: Localized;
  description: Localized;
  body: Localized<string[]>;
  score: Score;
}
export interface SharedProps {
  appName: string;
  locale: Locale;
  messages: Record<string, string>;
  errors: Record<string, string>;
  [key: string]: unknown;
}
export interface StudyProps extends SharedProps {
  lessons: Lesson[];
  view: "overview" | "lessons" | "lesson" | "practice" | "progress" | "library" | "harmony";
  selected: string;
}
