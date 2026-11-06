import { createHash } from "node:crypto";
import { mkdir, rename } from "node:fs/promises";
import { join } from "node:path";
import type { SampleRecord } from "../resources/js/music/audio";
import { frequency } from "../resources/js/music/theory";
import { tunePiano } from "./lib/piano-processing";
import { generatePcm, pcmFromWav, wavFromPcm16 } from "./lib/piano-samples";

const root = join(import.meta.dir, "..");
const cache = join(root, "storage/audio-sources/elevenlabs-v3-wav");
const staging = join(root, "storage/audio-sources/bank-staging");
const output = join(root, "storage/audio-bank/elevenlabs-piano");
const anchors = [21, 27, 33, 39, 45, 51, 57, 60, 63, 69, 75, 81, 87, 93, 99, 105, 108];
const args = Bun.argv.slice(2);
const limit = Number(args[args.indexOf("--limit") + 1]);
if (!args.includes("--generate")) {
  console.log(JSON.stringify({ keys: 88, anchors, maxRequests: anchors.length, cachedResponsesReused: true }, null, 2));
  process.exit(0);
}
if (!args.includes("--limit") || !Number.isInteger(limit) || limit < anchors.length || limit > 17)
  throw new Error("Pass --limit 17: at most one request per source anchor, with no automatic billed retry");
const apiKey = process.env.ELEVENLABS_API_KEY;
const planFile = Bun.file(join(cache, "account-plan.json"));
let accountTier = (await planFile.exists()) ? (await planFile.json()).tier : "not recorded";
if (accountTier === "not recorded" && apiKey) {
  const response = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
    headers: { "xi-api-key": apiKey },
    signal: AbortSignal.timeout(15000),
  });
  if (response.ok) {
    const subscription = (await response.json()) as { tier?: string };
    accountTier = subscription.tier ?? "not recorded";
    await mkdir(cache, { recursive: true });
    await Bun.write(planFile, JSON.stringify({ tier: accountTier, observedAt: new Date().toISOString() }));
  }
}
for (const directory of [cache, staging, output]) await mkdir(directory, { recursive: true });
const sha = (data: Uint8Array) => createHash("sha256").update(data).digest("hex");
const sources: { midi: number; pcm: Uint8Array; frequency: number; sha256: string }[] = [];
const rejected: { midi: number; reason: string }[] = [];
let requests = 0;
for (const midi of anchors) {
  try {
    const file = Bun.file(join(cache, `${midi}.wav`));
    if (!(await file.exists())) {
      if (!apiKey) throw new Error("Configure ELEVENLABS_API_KEY privately for missing sources");
      if (++requests > limit) throw new Error("Request limit reached");
      await generatePcm({
        apiKey,
        midi,
        preserve: async (bytes) => {
          await Bun.write(file, bytes);
        },
      });
    }
    const bytes = await file.bytes();
    const pcm = pcmFromWav(bytes);
    const sample = await tunePiano(pcm, midi);
    sources.push({ midi, pcm, frequency: sample.sourceFrequency, sha256: sha(bytes) });
    console.log(`Source MIDI${midi}: retained, measured ${sample.sourceFrequency.toFixed(2)}Hz`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Source rejected";
    rejected.push({ midi, reason });
    console.log(`Source MIDI${midi}: ${reason}; no billed retry`);
    if (/request failed \((401|403|429)\)/.test(reason)) break;
  }
}
if (!sources.length) throw new Error("No usable generated source; existing production bank unchanged");
const samples: SampleRecord[] = [];
const records = [];
for (let midi = 21; midi <= 108; midi++) {
  const nearest = [...sources].sort(
    (a, b) => Math.abs(Math.log2(a.frequency / frequency(midi))) - Math.abs(Math.log2(b.frequency / frequency(midi))),
  );
  let accepted = false;
  for (const source of nearest) {
    try {
      const sample = await tunePiano(source.pcm, midi);
      const wav = wavFromPcm16(sample.pcm);
      await Bun.write(join(staging, `${midi}.wav`), wav);
      samples.push({
        midi,
        url: `/audio/piano/${midi}.wav`,
        frequency: sample.frequency,
        cents: sample.cents,
        validated: true,
      });
      records.push({
        midi,
        sourceRequestedMidi: source.midi,
        sourceSha256: source.sha256,
        sourceFrequency: sample.sourceFrequency,
        resamplingRatio: sample.ratio,
        sourceOnsetSeconds: sample.sourceOnsetSeconds,
        frequency: sample.frequency,
        cents: sample.cents,
        sha256: sha(wav),
        bytes: wav.length,
      });
      console.log(`Key MIDI${midi}: ${sample.cents.toFixed(2)} cents, source ${source.midi}`);
      accepted = true;
      break;
    } catch {
      /* Try another cached source without another API call. */
    }
  }
  if (!accepted) throw new Error(`Cannot validate MIDI${midi}; existing production manifest unchanged`);
}
const provenance = {
  provider: "ElevenLabs",
  model: "eleven_text_to_sound_v3",
  generatedAt: new Date().toISOString(),
  bank: "88-key classical acoustic piano",
  accountTierAtGeneration: accountTier,
  license: "ElevenLabs Sound Effects terms; private internal use. No standalone/public sample redistribution.",
  processing:
    "Generated WAV PCM16 stereo downmix, onset trim, libsoxr sample-rate pitch correction; nearest measured source per key; no synthetic replacement",
  listeningReview: "pending",
  requestedAnchors: anchors,
  requestsThisRun: requests,
  usableSources: sources.map(({ midi, frequency, sha256 }) => ({ midi, frequency, sha256 })),
  rejectedSources: rejected,
  notes: records,
};
for (const sample of samples) await rename(join(staging, `${sample.midi}.wav`), join(output, `${sample.midi}.wav`));
await Bun.write(join(output, "provenance.json"), `${JSON.stringify(provenance, null, 2)}\n`);
await Bun.write(
  join(output, "manifest.json.tmp"),
  `${JSON.stringify({ version: 1, provider: "elevenlabs", tuning: "12-TET A4=440Hz", samples }, null, 2)}\n`,
);
await rename(join(output, "manifest.json.tmp"), join(output, "manifest.json"));
console.log(
  `Created private bank: ${samples.length} measured keys from ${sources.length} generated sources; ${requests} requests this run. Listening review remains pending.`,
);
