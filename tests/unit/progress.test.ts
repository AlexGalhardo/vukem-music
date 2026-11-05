import { expect, test } from "bun:test";
import { parseProgress } from "../../resources/js/lib/progress";

test("local progress rejects corrupt, unversioned or impossible data", () => {
  const empty = { version: 1 as const, completed: [], attempts: 0, correct: 0 };
  for (const value of [
    null,
    "bad-json",
    "null",
    "[]",
    "{}",
    '{"version":2}',
    '{"version":1,"completed":[],"attempts":1,"correct":2}',
  ])
    expect(parseProgress(value)).toEqual(empty);
  expect(
    parseProgress(JSON.stringify({ version: 1, completed: ["treble-clef", "treble-clef"], attempts: 3, correct: 2 })),
  ).toEqual({ version: 1, completed: ["treble-clef"], attempts: 3, correct: 2 });
});
