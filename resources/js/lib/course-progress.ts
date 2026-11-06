import { useSyncExternalStore } from "react";
export const COURSE_KEY = "vukem-music:course:v1";
export interface CourseProgress {
  version: 1;
  read: string[];
  attempts: number;
  correct: number;
  rounds: number;
  best: number;
}
export const emptyCourse = (): CourseProgress => ({
  version: 1,
  read: [],
  attempts: 0,
  correct: 0,
  rounds: 0,
  best: 0,
});
export function validCourse(value: unknown): value is CourseProgress {
  if (!value || typeof value !== "object") return false;
  const v = value as CourseProgress;
  return (
    Object.keys(v).every((key) => ["version", "read", "attempts", "correct", "rounds", "best"].includes(key)) &&
    v.version === 1 &&
    Array.isArray(v.read) &&
    v.read.length <= 58 &&
    new Set(v.read).size === v.read.length &&
    v.read.every((id) => /^chapter-(0[1-9]|[1-4][0-9]|5[0-8])$/.test(id)) &&
    [v.attempts, v.correct, v.rounds, v.best].every((n) => Number.isSafeInteger(n) && n >= 0) &&
    v.correct <= v.attempts &&
    v.best <= 10 &&
    v.best <= v.correct &&
    (v.rounds > 0 || v.best === 0) &&
    v.rounds <= Math.floor(v.attempts / 10)
  );
}
let state = emptyCourse();
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => {
  for (const listener of listeners) listener();
};
const load = () => {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v: unknown = JSON.parse(localStorage.getItem(COURSE_KEY) ?? "null");
    if (validCourse(v)) state = v;
  } catch {}
};
export function replaceCourse(v: CourseProgress) {
  if (!validCourse(v)) throw new Error("Invalid course progress");
  state = { ...v, read: [...new Set(v.read)] };
  loaded = true;
  try {
    localStorage.setItem(COURSE_KEY, JSON.stringify(state));
  } catch {}
  emit();
}
function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== COURSE_KEY && e.key !== null) return;
    loaded = false;
    state = emptyCourse();
    load();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
const server = emptyCourse();
export function useCourseProgress() {
  const progress = useSyncExternalStore(
    subscribe,
    () => {
      load();
      return state;
    },
    () => server,
  );
  return {
    progress,
    read: (id: string) => replaceCourse({ ...state, read: [...new Set([...state.read, id])] }),
    answer: (correct: boolean) =>
      replaceCourse({ ...state, attempts: state.attempts + 1, correct: state.correct + Number(correct) }),
    round: (score: number) => replaceCourse({ ...state, rounds: state.rounds + 1, best: Math.max(state.best, score) }),
  };
}
export function currentCourse() {
  load();
  return state;
}
