import { releaseNotes } from "./lib/release-notes";

const tag = Bun.argv[2] ?? "";
const packageJson = await Bun.file(new URL("../package.json", import.meta.url)).json();
if (tag !== `v${packageJson.version}`) throw new Error("Tag must match package.json version");
const file = new URL("../CHANGELOG.md", import.meta.url);
process.stdout.write(releaseNotes(await Bun.file(file).text(), tag));
