import { mkdir, rename } from "node:fs/promises";
import { join } from "node:path";
import { type SampleRecord, validSample } from "../resources/js/music/audio";
import { frequency } from "../resources/js/music/theory";
import { auditPcm16, generatePcm, wavFromPcm16 } from "./lib/piano-samples";

const args = Bun.argv.slice(2);
const number = (key: string, fallback: number) => (args.includes(key) ? Number(args[args.indexOf(key) + 1]) : fallback);
const from = number("--from", 60);
const to = number("--to", from);
const limit = number("--limit", 4);
if (
  ![from, to, limit].every(Number.isInteger) ||
  from < 21 ||
  to > 108 ||
  to < from ||
  limit < 1 ||
  limit > 88 ||
  to - from + 1 > limit
)
  throw new Error("Use MIDI21–108, --from <= --to, and an explicit --limit up to 88");
const notes = Array.from({ length: to - from + 1 }, (_, i) => i + from);
if (!args.includes("--generate")) {
  console.log(
    JSON.stringify(
      {
        dryRun: true,
        notes: notes.map((midi) => ({ midi, hz: frequency(midi) })),
        durationSecondsPerNote: 3,
        maxRequests: notes.length,
      },
      null,
      2,
    ),
  );
} else {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("Set ELEVENLABS_API_KEY in the server/CLI environment; never expose it to Vite");
  const output = join(import.meta.dir, "../resources/public/audio/piano");
  await mkdir(output, { recursive: true });
  const manifestPath = join(output, "manifest.json");
  const manifest = await Bun.file(manifestPath).json();
  if (manifest.version !== 1 || !Array.isArray(manifest.samples) || !manifest.samples.every(validSample))
    throw new Error("Invalid existing manifest");
  const existing = manifest.samples as SampleRecord[];
  for (const midi of notes) {
    if (existing.some((sample) => sample.midi === midi)) {
      console.log(`MIDI${midi}: cached, skipping billed request`);
      continue;
    }
    const pcm = await generatePcm({ apiKey, midi });
    const audit = auditPcm16(pcm, midi);
    const file = join(output, `${midi}.wav`);
    await Bun.write(`${file}.tmp`, wavFromPcm16(audit.pcm));
    await rename(`${file}.tmp`, file);
    existing.push({
      midi,
      url: `/audio/piano/${midi}.wav`,
      frequency: audit.frequency,
      cents: audit.cents,
      validated: true,
    });
    existing.sort((a, b) => a.midi - b.midi);
    manifest.samples = existing;
    await Bun.write(`${manifestPath}.tmp`, `${JSON.stringify(manifest, null, 2)}\n`);
    await rename(`${manifestPath}.tmp`, manifestPath);
    console.log(`MIDI${midi}: accepted (${audit.cents.toFixed(2)} cents). Listening review is still required.`);
  }
}
