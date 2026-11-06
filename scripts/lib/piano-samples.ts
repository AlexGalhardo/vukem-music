import { frequency } from "../../resources/js/music/theory";

/** Fundamental estimation with cumulative-normalized difference (YIN), not peak FFT. */
export function estimatePitch(input: Float32Array, rate: number): number | null {
  const stride = 1; // Preserve upper-octave pitch resolution before fundamental estimation.
  const sampleRate = rate / stride;
  const samples = Float32Array.from({ length: Math.floor(input.length / stride) }, (_, i) => input[i * stride]);
  const maxTau = Math.ceil(sampleRate / 20);
  const size = Math.min(4096, samples.length - maxTau);
  if (size < 256) return null;
  let rms = 0;
  for (let i = 0; i < size; i++) rms += samples[i] ** 2;
  if (Math.sqrt(rms / size) < 0.004) return null;
  const diff = new Float64Array(maxTau + 1);
  for (let tau = 1; tau <= maxTau; tau++) {
    for (let i = 0; i < size; i++) diff[tau] += (samples[i] - samples[i + tau]) ** 2;
  }
  const normalized = new Float64Array(maxTau + 1);
  let sum = 0;
  for (let tau = 1; tau <= maxTau; tau++) {
    sum += diff[tau];
    normalized[tau] = sum > 0 ? (diff[tau] * tau) / sum : 1;
  }
  for (let tau = Math.max(2, Math.floor(sampleRate / 4500)); tau < maxTau; tau++) {
    if (normalized[tau] < 0.12) {
      while (tau + 1 < maxTau && normalized[tau + 1] < normalized[tau]) tau++;
      const left = normalized[tau - 1];
      const right = normalized[tau + 1];
      const center = normalized[tau];
      const denominator = 2 * (2 * center - right - left);
      const adjustment = denominator ? (right - left) / denominator : 0;
      return sampleRate / (tau + adjustment);
    }
  }
  return null;
}

export function auditPcm16(pcm: Uint8Array, midi: number, rate = 44100) {
  if (pcm.byteLength % 2 !== 0) throw new Error("Invalid PCM length");
  const view = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  const samples = new Float32Array(pcm.byteLength / 2);
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    samples[i] = view.getInt16(i * 2, true) / 32768;
    peak = Math.max(peak, Math.abs(samples[i]));
  }
  if (peak > 0.995) throw new Error("Clipped sample rejected");
  let onset = -1;
  for (let i = 0; i < samples.length - 64; i += 64) {
    let power = 0;
    for (let j = 0; j < 64; j++) power += samples[i + j] ** 2;
    if (Math.sqrt(power / 64) > 0.008) {
      onset = i;
      break;
    }
  }
  if (onset < 0) throw new Error("Silent sample rejected");
  const onsetSeconds = onset / rate;
  if (onsetSeconds > 0.35) throw new Error("Late attack rejected; regenerate the one-shot");
  // Skip the first 30ms of noisy piano attack when estimating the fundamental.
  const start = onset + Math.floor(rate * 0.03);
  const measured = estimatePitch(samples.slice(start, start + rate), rate);
  if (!measured) throw new Error("No stable fundamental found");
  const cents = 1200 * Math.log2(measured / frequency(midi));
  if (Math.abs(cents) > 20) throw new Error(`Tuning rejected: ${cents.toFixed(1)} cents`);
  return { frequency: measured, cents, onsetSeconds, pcm: pcm.slice(onset * 2) };
}

export function wavFromPcm16(pcm: Uint8Array, rate = 44100): Uint8Array {
  const bytes = new Uint8Array(44 + pcm.length);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string) =>
    [...value].forEach((char, index) => {
      view.setUint8(offset + index, char.charCodeAt(0));
    });
  text(0, "RIFF");
  view.setUint32(4, 36 + pcm.length, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, pcm.length, true);
  bytes.set(pcm, 44);
  return bytes;
}

export interface GenerateOptions {
  apiKey: string;
  midi: number;
  request?: (url: string, options: RequestInit) => Promise<Response>;
  preserve?: (bytes: Uint8Array) => Promise<void>;
}
/** Decode an explicit WAV header instead of guessing raw PCM channel count. */
export function pcmFromWav(bytes: Uint8Array): Uint8Array {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = (offset: number) => new TextDecoder().decode(bytes.slice(offset, offset + 4));
  if (bytes.length < 44 || tag(0) !== "RIFF" || tag(8) !== "WAVE" || view.getUint32(4, true) + 8 !== bytes.length)
    throw new Error("Invalid generated WAV container");
  let channels = 0;
  let rate = 0;
  let data: Uint8Array | null = null;
  for (let at = 12, chunks = 0; at + 8 <= bytes.length; chunks++) {
    if (chunks > 64) throw new Error("Too many WAV chunks");
    const size = view.getUint32(at + 4, true);
    if (at + 8 + size > bytes.length) throw new Error("Truncated WAV chunk");
    if (tag(at) === "fmt ") {
      if (size < 16 || view.getUint16(at + 8, true) !== 1 || view.getUint16(at + 22, true) !== 16)
        throw new Error("Expected 16-bit PCM WAV");
      channels = view.getUint16(at + 10, true);
      rate = view.getUint32(at + 12, true);
    }
    if (tag(at) === "data") data = bytes.slice(at + 8, at + 8 + size);
    at += 8 + size + (size % 2);
  }
  if (!data || ![1, 2].includes(channels) || rate !== 44100 || data.length % (channels * 2))
    throw new Error("Expected mono/stereo 44.1kHz WAV");
  const frames = data.length / (channels * 2);
  if (frames < 2205 || frames > 44100 * 8) throw new Error("Unexpected generated WAV duration");
  if (channels === 1) return data;
  const input = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const mono = new Uint8Array(frames * 2);
  const output = new DataView(mono.buffer);
  for (let i = 0; i < frames; i++)
    output.setInt16(i * 2, Math.round((input.getInt16(i * 4, true) + input.getInt16(i * 4 + 2, true)) / 2), true);
  return mono;
}
export async function generatePcm({ apiKey, midi, request = fetch, preserve }: GenerateOptions): Promise<Uint8Array> {
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is required");
  if (!Number.isInteger(midi) || midi < 21 || midi > 108) throw new Error("MIDI outside piano range");
  const response = await request("https://api.elevenlabs.io/v1/sound-generation?output_format=wav_44100", {
    method: "POST",
    signal: AbortSignal.timeout(60000),
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      model_id: "eleven_text_to_sound_v3",
      duration_seconds: 3,
      prompt_influence: 1,
      loop: false,
      text: `One isolated acoustic concert grand piano note: ${["C", "C sharp", "D", "E flat", "E", "F", "F sharp", "G", "A flat", "A", "B flat", "B"][midi % 12]}${Math.floor(midi / 12) - 1}, fundamental ${frequency(midi).toFixed(3)} Hz. A single key struck once at the very beginning, followed only by its natural decay. Dry close microphone, classical piano timbre. Absolutely no other notes, melody, chords, voice, pedal, noise or reverb.`,
    }),
  });
  if (!response.ok) throw new Error(`ElevenLabs request failed (${response.status}); no automatic billed retry`);
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > 2 * 1024 * 1024 || buffer.byteLength < 44) throw new Error("Unexpected generated WAV size");
  const bytes = new Uint8Array(buffer);
  await preserve?.(bytes.slice());
  return pcmFromWav(bytes);
}
