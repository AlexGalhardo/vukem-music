import { expect, test } from "bun:test";
import { releaseNotes } from "../../scripts/lib/release-notes";

test("release extraction preserves categories and selects the exact version", () => {
  const log =
    "# Changelog\n\n## [Unreleased]\n\n## [0.1.10] - 2026-11-06\n\n### Added\n\n- other\n\n## [0.1.0] - 2026-11-06\n\n### Added\n\n- initial\n\n### Security\n\n- bounded\n";
  expect(releaseNotes(log.replaceAll("\n", "\r\n"), "v0.1.0")).toBe(
    "### Added\n\n- initial\n\n### Security\n\n- bounded\n",
  );
  expect(() => releaseNotes(log, "v0.2.0")).toThrow("exactly one");
  expect(() => releaseNotes(log, "v0.1.0;echo unsafe")).toThrow("stable version");
  expect(() => releaseNotes(`${log}\n## [0.1.0] - 2026-11-06\n`, "v0.1.0")).toThrow("exactly one");
  expect(() => releaseNotes("## [0.1.0] - 2026-11-06\nTODO", "v0.1.0")).toThrow("categorized");
});
