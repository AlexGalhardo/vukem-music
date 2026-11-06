import { useCallback, useSyncExternalStore } from "react";

export const PROGRESS_KEY = "vukem-music:progress:v1";
export interface Progress {
  version: 1;
  completed: string[];
  attempts: number;
  correct: number;
}
export const empty = (): Progress => ({ version: 1, completed: [], attempts: 0, correct: 0 });
export function parseProgress(raw: string | null): Progress {
  if (!raw) return empty();
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return empty();
    const v = value as Partial<Progress>;
    if (
      v.version !== 1 ||
      !Array.isArray(v.completed) ||
      !v.completed.every((id) => typeof id === "string" && /^[a-z-]{1,80}$/.test(id)) ||
      !Number.isSafeInteger(v.attempts) ||
      !Number.isSafeInteger(v.correct) ||
      (v.attempts ?? -1) < 0 ||
      (v.correct ?? -1) < 0 ||
      (v.correct ?? 0) > (v.attempts ?? 0)
    )
      return empty();
    return {
      version: 1,
      completed: [...new Set(v.completed)],
      attempts: v.attempts as number,
      correct: v.correct as number,
    };
  } catch {
    return empty();
  }
}
export function validFoundation(value: unknown): value is Progress {
  if (!value || typeof value !== "object") return false;
  const v = value as Progress;
  return (
    Object.keys(v).every((key) => ["version", "completed", "attempts", "correct"].includes(key)) &&
    v.version === 1 &&
    Array.isArray(v.completed) &&
    v.completed.length <= 500 &&
    new Set(v.completed).size === v.completed.length &&
    v.completed.every((id) => typeof id === "string" && /^[a-z-]{1,80}$/.test(id)) &&
    Number.isSafeInteger(v.attempts) &&
    Number.isSafeInteger(v.correct) &&
    v.attempts >= 0 &&
    v.attempts <= 1000000000 &&
    v.correct >= 0 &&
    v.correct <= v.attempts
  );
}
export function replaceProgress(value: Progress) {
  if (!validFoundation(value)) throw new Error("Invalid foundation progress");
  loaded = true;
  update({ version: 1, completed: [...new Set(value.completed)], attempts: value.attempts, correct: value.correct });
}
export function currentProgress() {
  load();
  return state;
}
let state = empty();
let loaded = false;
let storageAvailable = true;
const listeners = new Set<() => void>();
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    state = parseProgress(localStorage.getItem(PROGRESS_KEY));
  } catch {
    storageAvailable = false;
  }
}
function emit() {
  for (const listener of listeners) listener();
}
function update(next: Progress) {
  state = next;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  } catch {
    storageAvailable = false;
  }
  emit();
}
function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === PROGRESS_KEY || event.key === null) {
      state = parseProgress(event.newValue);
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
const serverState = empty();
export function useProgress() {
  const progress = useSyncExternalStore(
    subscribe,
    () => {
      load();
      return state;
    },
    () => serverState,
  );
  return {
    progress,
    storageAvailable,
    complete: useCallback((id: string) => update({ ...state, completed: [...new Set([...state.completed, id])] }), []),
    answer: useCallback(
      (correct: boolean) =>
        update({ ...state, attempts: state.attempts + 1, correct: state.correct + Number(correct) }),
      [],
    ),
    reset: useCallback(() => update(empty()), []),
  };
}
