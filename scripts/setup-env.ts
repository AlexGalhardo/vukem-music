import { randomBytes } from "node:crypto";
import { chmod, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { withApplicationKey } from "./lib/setup-environment";

const root = join(import.meta.dir, "..");
const destination = join(root, ".env");
let source: string;
try {
  source = await readFile(destination, "utf8");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  source = await readFile(join(root, ".env.example"), "utf8");
}
const result = withApplicationKey(source, () => `base64:${randomBytes(32).toString("base64")}`);
if (result.generated) {
  await writeFile(`${destination}.tmp`, result.contents, { mode: 0o600 });
  await rename(`${destination}.tmp`, destination);
}
await chmod(destination, 0o600);
console.log(
  result.generated
    ? ".env prepared with a private application key (not displayed)."
    : "Existing application key preserved.",
);
