import { type CourseProgress, currentCourse, replaceCourse, validCourse } from "./course-progress";
import { currentProgress, type Progress, replaceProgress, validFoundation } from "./progress";
export interface LearningBackup {
  version: 1;
  foundation: Progress;
  course: CourseProgress;
}
export function validBackup(value: unknown): value is LearningBackup {
  if (!value || typeof value !== "object") return false;
  const v = value as LearningBackup;
  return (
    Object.keys(v).every((key) => ["version", "foundation", "course"].includes(key)) &&
    v.version === 1 &&
    validFoundation(v.foundation) &&
    validCourse(v.course)
  );
}
export function learningBackup(): LearningBackup {
  return { version: 1, foundation: currentProgress(), course: currentCourse() };
}
export function restoreBackup(value: unknown) {
  if (!validBackup(value)) throw new Error("invalid-progress");
  replaceProgress(value.foundation);
  replaceCourse(value.course);
}
export function parseBackup(raw: string): LearningBackup {
  if (raw.length > 65536) throw new Error("invalid-progress");
  const value: unknown = JSON.parse(raw);
  if (!validBackup(value)) throw new Error("invalid-progress");
  return value;
}
export function downloadBackup() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(learningBackup(), null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "vukem-music-progress.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
