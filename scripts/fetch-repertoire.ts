import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import repertoire from "../resources/js/data/repertoire.json";

// Downloads unmodified source editions; page excerpts are identified in the manifest.
const editions = new Map(repertoire.map((work) => [work.sourceSha256, work]));
const output = resolve(import.meta.dir, "../storage/repertoire");
const digest = (data: Uint8Array) => createHash("sha256").update(data).digest("hex");
if (!Bun.argv.includes("--download")) {
  console.log(
    `${repertoire.length} works; ${editions.size} source editions. Run with --download to fetch and verify into storage/repertoire.`,
  );
} else {
  await mkdir(output, { recursive: true });
  for (const [sha, work] of editions) {
    const file = Bun.file(resolve(output, `${sha}.pdf`));
    if (await file.exists()) {
      if (digest(new Uint8Array(await file.arrayBuffer())) !== sha)
        throw new Error(`Cached source hash mismatch: ${work.id}`);
      console.log(`${work.id}: verified cache`);
      continue;
    }
    const url = new URL(work.pdfUrl);
    url.hash = "";
    const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
    if (!response.ok) throw new Error(`${work.id}: HTTP ${response.status}`);
    const data = new Uint8Array(await response.arrayBuffer());
    if (
      data.length > 64 * 1024 * 1024 ||
      new TextDecoder().decode(data.slice(0, 5)) !== "%PDF-" ||
      digest(data) !== sha
    )
      throw new Error(
        `${work.id}: source changed or response is not the verified PDF. Review the edition before updating hashes.`,
      );
    await Bun.write(file, data);
    console.log(`${work.id}: downloaded and verified`);
  }
  await Bun.write(resolve(output, "manifest.json"), `${JSON.stringify(repertoire, null, 2)}\n`);
}
