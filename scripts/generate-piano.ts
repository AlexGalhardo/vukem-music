import { createHash } from "node:crypto";
import { mkdir, rename } from "node:fs/promises";
import { join } from "node:path";
import { type SampleRecord, validSample } from "../resources/js/music/audio";
import { frequency } from "../resources/js/music/theory";
import { tunePiano } from "./lib/piano-processing";
import { auditPcm16, generatePcm, pcmFromWav, wavFromPcm16 } from "./lib/piano-samples";

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
  const output = join(import.meta.dir, "../storage/audio-bank/individual");
  await mkdir(output, { recursive: true });
  const manifestPath = join(output, "manifest.json");
  const manifest = (await Bun.file(manifestPath).exists())
    ? await Bun.file(manifestPath).json()
    : { version: 1, provider: "elevenlabs", samples: [] };
  if (manifest.version !== 1 || !Array.isArray(manifest.samples) || !manifest.samples.every(validSample))
    throw new Error("Invalid existing manifest");
  const existing = manifest.samples as SampleRecord[];
  const cache = join(import.meta.dir, "../storage/audio-sources/elevenlabs-v3-wav");
  await mkdir(cache, { recursive: true });
  const provenancePath = join(output, "provenance.json");
  const provenance = (await Bun.file(provenancePath).exists())
    ? await Bun.file(provenancePath).json()
    : {
        provider: "ElevenLabs",
        model: "eleven_text_to_sound_v3",
        license: "ElevenLabs Sound Effects terms; private internal use, no standalone sample redistribution",
        generatedAt: new Date().toISOString(),
        processing:
          "WAV PCM16 stereo downmix, onset trim, optional libsoxr resampling to concert pitch; no synthetic replacement",
        listeningReview: "pending",
        notes: {},
      };
  const failures: { midi: number; error: string }[] = [];
  for (const midi of notes) {
    if (existing.some((sample) => sample.midi === midi)) {
      console.log(`MIDI${midi}: cached, skipping billed request`);
      continue;
    }
    try {
      const raw = Bun.file(join(cache, `${midi}.wav`));
      const pcm = (await raw.exists())
        ? pcmFromWav(await raw.bytes())
        : await generatePcm({
            apiKey,
            midi,
            preserve: async (bytes) => {
              await Bun.write(raw, bytes);
            },
          });
      const audit = args.includes("--retune") ? await tunePiano(pcm, midi) : auditPcm16(pcm, midi);
      const file = join(output, `${midi}.wav`);
      const wav = wavFromPcm16(audit.pcm);
      await Bun.write(`${file}.tmp`, wav);
      provenance.notes[String(midi)] = {
        requestedMidi: midi,
        sourceFrequency: "sourceFrequency" in audit ? audit.sourceFrequency : audit.frequency,
        resamplingRatio: "ratio" in audit ? audit.ratio : 1,
        frequency: audit.frequency,
        cents: audit.cents,
        rawSha256: createHash("sha256")
          .update(await raw.bytes())
          .digest("hex"),
        sha256: createHash("sha256").update(wav).digest("hex"),
      };
      await Bun.write(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Audio validation failed";
      failures.push({ midi, error: message });
      console.log(`MIDI${midi}: ${message}; response retained for review, no automatic retry`);
      if (/request failed \((401|403|429)\)/.test(message)) break;
    }
  }
  await Bun.write(
    join(cache, "last-report.json"),
    JSON.stringify({ notes, accepted: existing.length, failures }, null, 2),
  );
  if (failures.length) process.exitCode = 1;
}
