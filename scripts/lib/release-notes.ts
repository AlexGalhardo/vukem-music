/** Extract the exact changelog entry; publication must never use another version's notes. */
export function releaseNotes(changelog: string, tag: string): string {
  if (!/^v\d+\.\d+\.\d+$/.test(tag)) throw new Error("Use a stable version tag: vX.Y.Z");
  const version = tag.slice(1);
  const lines = changelog.replace(/\r\n/g, "\n").split("\n");
  const heading = new RegExp(`^## \\[${version.replaceAll(".", "\\.")}\\] - \\d{4}-\\d{2}-\\d{2}$`);
  const matches = lines.flatMap((line, i) => (heading.test(line) ? [i] : []));
  if (matches.length !== 1) throw new Error(`Expected exactly one changelog entry for ${tag}`);
  const start = matches[0] + 1;
  const next = lines.findIndex((line, i) => i >= start && /^## /.test(line));
  const notes = lines
    .slice(start, next < 0 ? undefined : next)
    .join("\n")
    .trim();
  if (!/^### (Added|Changed|Fixed|Security)$/m.test(notes) || !/^- /m.test(notes))
    throw new Error("Release notes need categorized changes");
  return `${notes}\n`;
}
