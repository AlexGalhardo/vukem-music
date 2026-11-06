import { frequency } from "../../resources/js/music/theory";
import { auditPcm16, estimatePitch } from "./piano-samples";

/** Offline processing only: preserve the generated timbre while tuning a one-shot. */
export async function tunePiano(pcm: Uint8Array, midi: number) {
  const view = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  const samples = Float32Array.from({ length: pcm.length / 2 }, (_, i) => view.getInt16(i * 2, true) / 32768);
  let onset = -1;
  let peak = 0;
  for (const value of samples) peak = Math.max(peak, Math.abs(value));
  if (peak > 0.995) throw new Error("Clipped source rejected");
  for (let i = 0; i + 64 <= samples.length; i += 64) {
    let power = 0;
    for (let j = 0; j < 64; j++) power += samples[i + j] ** 2;
    if (Math.sqrt(power / 64) > 0.008) {
      onset = i;
      break;
    }
  }
  if (onset < 0) throw new Error("Silent source rejected");
  const pitches = [0.03, 0.12, 0.24].map((offset) => {
    const at = onset + Math.floor(offset * 44100);
    return estimatePitch(samples.slice(at, at + 44100), 44100);
  });
  if (pitches.some((pitch) => !pitch)) throw new Error("No stable source pitch");
  const sourceFrequency = pitches[0] as number;
  if (pitches.some((pitch) => Math.abs(1200 * Math.log2((pitch as number) / sourceFrequency)) > 45))
    throw new Error("Changing source pitch rejected");
  let result = pcm.slice(onset * 2);
  let measured = sourceFrequency;
  let totalRatio = 1;
  for (let pass = 0; pass < 4; pass++) {
    const ratio = frequency(midi) / measured;
    totalRatio *= ratio;
    const process = Bun.spawn(
      [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-nostdin",
        "-f",
        "s16le",
        "-ar",
        String(Math.round(44100 * ratio)),
        "-ac",
        "1",
        "-i",
        "pipe:0",
        "-af",
        "aresample=44100:resampler=soxr,atrim=duration=6,afade=t=out:st=5.9:d=0.1",
        "-f",
        "s16le",
        "-ar",
        "44100",
        "-ac",
        "1",
        "pipe:1",
      ],
      { stdin: new Blob([result]), stdout: "pipe", stderr: "pipe" },
    );
    result = new Uint8Array(await new Response(process.stdout).arrayBuffer());
    if (await process.exited) throw new Error("FFmpeg tuning failed; install FFmpeg with libsoxr");
    if (result.length > 44100 * 2 * 6) throw new Error("Processed sample duration limit");
    try {
      const audit = auditPcm16(result, midi);
      if (Math.abs(audit.cents) <= 3 || (pass === 3 && Math.abs(audit.cents) <= 5))
        return { ...audit, sourceFrequency, ratio: totalRatio, sourceOnsetSeconds: onset / 44100 };
      if (pass === 3) throw new Error("Tuning precision target not reached");
      measured = audit.frequency;
    } catch (error) {
      const data = new DataView(result.buffer, result.byteOffset, result.byteLength);
      const floats = Float32Array.from({ length: result.length / 2 }, (_, i) => data.getInt16(i * 2, true) / 32768);
      const pitch = estimatePitch(floats.slice(1323, 45423), 44100);
      if (pass === 3 || !pitch || !(error instanceof Error) || !error.message.startsWith("Tuning rejected"))
        throw error;
      measured = pitch;
    }
  }
  throw new Error("Tuning failed");
}
