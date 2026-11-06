export interface MidiAction {
  type: "on" | "off" | "pedal" | "reset";
  channel: number;
  note: number;
  velocity: number;
  down?: boolean;
}
export function decodeMidi(data: Uint8Array): MidiAction | null {
  if (data.length < 1) return null;
  const command = data[0] & 0xf0;
  const channel = data[0] & 15;
  const note = data[1] ?? 0;
  const velocity = (data[2] ?? 0) / 127;
  if ((command === 0x90 || command === 0x80) && data.length >= 3 && note >= 21 && note <= 108)
    return { type: command === 0x80 || velocity === 0 ? "off" : "on", channel, note, velocity };
  if (command === 0xb0 && data.length >= 3) {
    if (note === 64) return { type: "pedal", channel, note, velocity, down: data[2] >= 64 };
    if (note === 120 || note === 123) return { type: "reset", channel, note, velocity };
  }
  return null;
}
export interface Detection {
  frequency: number;
  midi: number;
  cents: number;
  confidence: number;
  rms: number;
}
/** YIN-style monophonic estimator. It does not certify instrument performance. */
export function detectPitch(samples: Float32Array, sampleRate: number): Detection | null {
  if (samples.length < 2048 || !Number.isFinite(sampleRate) || sampleRate < 8000) return null;
  const rms = Math.sqrt(samples.reduce((sum, x) => sum + x * x, 0) / samples.length);
  if (rms < 0.012) return null;
  const min = Math.max(2, Math.floor(sampleRate / 1200));
  const max = Math.min(Math.floor(sampleRate / 80), Math.floor(samples.length / 2));
  const difference = new Float64Array(max + 1);
  let sum = 0;
  for (let lag = 1; lag <= max; lag++) {
    let value = 0;
    for (let i = 0; i < samples.length - max; i++) {
      const delta = samples[i] - samples[i + lag];
      value += delta * delta;
    }
    sum += value;
    difference[lag] = sum ? (value * lag) / sum : 1;
  }
  let candidate = -1;
  for (let lag = min; lag < max; lag++) {
    if (difference[lag] < 0.1) {
      while (lag + 1 < max && difference[lag + 1] < difference[lag]) lag++;
      candidate = lag;
      break;
    }
  }
  if (candidate < 0) return null;
  const left = difference[candidate - 1];
  const middle = difference[candidate];
  const right = difference[candidate + 1];
  const denominator = 2 * (2 * middle - right - left);
  const lag = candidate + (denominator ? (right - left) / denominator : 0);
  const frequency = sampleRate / lag;
  const fractional = 69 + 12 * Math.log2(frequency / 440);
  const midi = Math.round(fractional);
  if (midi < 21 || midi > 108 || !Number.isFinite(frequency)) return null;
  return { frequency, midi, cents: (fractional - midi) * 100, confidence: Math.max(0, 1 - middle), rms };
}
