import { expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { enableGitHooks, withApplicationKey } from "../../scripts/lib/setup-environment";

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

test("setup points core.hooksPath at .githooks in a git checkout and skips elsewhere", () => {
  const repo = mkdtempSync(join(tmpdir(), "setup-hooks-"));
  const plain = mkdtempSync(join(tmpdir(), "setup-nogit-"));
  try {
    expect(Bun.spawnSync(["git", "init", "-q", repo]).exitCode).toBe(0);
    expect(enableGitHooks(repo)).toBe(true);
    const out = Bun.spawnSync(["git", "-C", repo, "config", "core.hooksPath"]).stdout.toString().trim();
    expect(out).toBe(".githooks");
    expect(enableGitHooks(plain)).toBe(false);
  } finally {
    rmSync(repo, { recursive: true, force: true });
    rmSync(plain, { recursive: true, force: true });
  }
});
