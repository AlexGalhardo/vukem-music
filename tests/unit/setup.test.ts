import { expect, test } from "bun:test";
import { withApplicationKey } from "../../scripts/lib/setup-environment";

test("setup fills an empty key without leaking/rotating an existing key or accepting duplicates", () => {
  let generations = 0;
  const generate = () => {
    generations++;
    return "test-only-generated-value";
  };
  const result = withApplicationKey("APP_NAME=music\nAPP_KEY=\n", generate);
  expect(result.generated).toBe(true);
  expect(result.contents).toContain("APP_KEY=test-only-generated-value");
  expect(withApplicationKey(result.contents, generate)).toEqual({ contents: result.contents, generated: false });
  expect(generations).toBe(1);
  expect(() => withApplicationKey("APP_KEY=\nAPP_KEY=\n", generate)).toThrow("Duplicate");
});
