import { createHash } from "node:crypto";
import { join } from "node:path";
import { type SampleRecord, validSample } from "../resources/js/music/audio";
import { auditPcm16, pcmFromWav } from "./lib/piano-samples";

const directory = join(import.meta.dir, "../storage/audio-bank/elevenlabs-piano");
const manifest = await Bun.file(join(directory, "manifest.json")).json();
const provenance = await Bun.file(join(directory, "provenance.json")).json();
if (manifest.version !== 1 || manifest.samples.length !== 88 || provenance.notes.length !== 88)
  throw new Error("Expected a complete 88-key bank and provenance");
let maxCents = 0;
let totalBytes = 0;
const midis = new Set<number>();
for (const sample of manifest.samples as SampleRecord[]) {
  if (!validSample(sample) || midis.has(sample.midi)) throw new Error("Invalid or duplicate sample");
  midis.add(sample.midi);
  const bytes = await Bun.file(join(directory, `${sample.midi}.wav`)).bytes();
  const record = provenance.notes.find((note: { midi: number }) => note.midi === sample.midi);
  if (!record || createHash("sha256").update(bytes).digest("hex") !== record.sha256)
    throw new Error(`Sample checksum mismatch: ${sample.midi}`);
  const measured = auditPcm16(pcmFromWav(bytes), sample.midi);
  if (Math.abs(measured.cents) > 5 || Math.abs(measured.cents - sample.cents) > 0.01)
    throw new Error(`Pitch verification failed: ${sample.midi}`);
  maxCents = Math.max(maxCents, Math.abs(measured.cents));
  totalBytes += bytes.length;
}
for (let midi = 21; midi <= 108; midi++) if (!midis.has(midi)) throw new Error(`Missing MIDI${midi}`);
const report = {
  verifiedAt: new Date().toISOString(),
  keys: midis.size,
  range: "A0–C8 (MIDI21–108)",
  format: "WAV PCM16 mono 44100Hz",
  maxAbsoluteCents: maxCents,
  totalBytes,
  listeningReview: provenance.listeningReview,
  distribution: "Private; ElevenLabs Sound Effects standalone sample redistribution restriction applies",
};
await Bun.write(join(directory, "verification.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
