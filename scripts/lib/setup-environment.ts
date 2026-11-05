export function withApplicationKey(source: string, generate: () => string): { contents: string; generated: boolean } {
  const matches = [...source.matchAll(/^APP_KEY=(.*)$/gm)];
  if (matches.length > 1) throw new Error("Duplicate APP_KEY entries; fix .env before running setup");
  // Never rotate an existing application key as a side effect of setup.
  if (matches[0]?.[1].trim()) return { contents: source, generated: false };
  const entry = `APP_KEY=${generate()}`;
  return {
    contents: matches.length ? source.replace(/^APP_KEY=.*$/m, entry) : `${source.trimEnd()}\n${entry}\n`,
    generated: true,
  };
}
