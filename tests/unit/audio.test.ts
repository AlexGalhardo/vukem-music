import { expect, test } from "bun:test";
import { validSample } from "../../resources/js/music/audio";
import { frequency } from "../../resources/js/music/theory";
import { auditPcm16, estimatePitch, generatePcm, pcmFromWav, wavFromPcm16 } from "../../scripts/lib/piano-samples";

function tone(hz: number, seconds = 1) {
  const floats = Float32Array.from(
    { length: 44100 * seconds },
    (_, index) => 0.4 * Math.sin((2 * Math.PI * hz * index) / 44100),
  );
  const pcm = new Uint8Array(floats.length * 2);
  const data = new DataView(pcm.buffer);
  floats.forEach((value, i) => {
    data.setInt16(i * 2, Math.round(value * 32767), true);
  });
  return { floats, pcm };
}

test("pitch audit accepts tuned notes and rejects silence, clipping and wrong pitch", () => {
  for (const midi of [21, 60, 69, 108])
    expect(estimatePitch(tone(frequency(midi)).floats, 44100)).toBeCloseTo(frequency(midi), midi === 108 ? -1 : 0);
  expect(Math.abs(auditPcm16(tone(440).pcm, 69).cents)).toBeLessThan(5);
  expect(() => auditPcm16(tone(440).pcm, 60)).toThrow("Tuning rejected");
  expect(() => auditPcm16(new Uint8Array(88200), 60)).toThrow("Silent");
  const clipped = new Uint8Array(88200);
  new DataView(clipped.buffer).setInt16(0, 32767, true);
  expect(() => auditPcm16(clipped, 60)).toThrow("Clipped");
  const wav = wavFromPcm16(tone(440).pcm);
  expect(new TextDecoder().decode(wav.slice(0, 4))).toBe("RIFF");
});

test("sample manifest forbids external files and unverified tuning", () => {
  const sample = { midi: 69, url: "/audio/piano/69.wav", validated: true, frequency: 440, cents: 0 };
  expect(validSample(sample)).toBe(true);
  expect(validSample({ ...sample, url: "https://example.com/a.wav" })).toBe(false);
  expect(validSample({ ...sample, frequency: 430 })).toBe(false);
  expect(validSample({ ...sample, validated: false })).toBe(false);
});

test("ElevenLabs integration keeps key in header and requests isolated bounded WAV", async () => {
  let calls = 0;
  const request = async (url: string | URL | Request, options: RequestInit) => {
    calls++;
    expect(String(url)).toContain("output_format=wav_44100");
    expect((options.headers as Record<string, string>)["xi-api-key"]).toBe("test-only");
    const body = JSON.parse(options.body as string);
    expect(body.duration_seconds).toBe(3);
    expect(body.model_id).toBe("eleven_text_to_sound_v3");
    return new Response(new Uint8Array(wavFromPcm16(tone(440).pcm)));
  };
  expect((await generatePcm({ apiKey: "test-only", midi: 69, request })).length).toBe(88200);
  expect(calls).toBe(1);
  const fail = async () => new Response("rate limited", { status: 429 });
  await expect(generatePcm({ apiKey: "test-only", midi: 69, request: fail })).rejects.toThrow("429");
  await expect(generatePcm({ apiKey: "", midi: 69, request })).rejects.toThrow("required");
});

test("generated WAV headers bound chunks and preserve stereo timing on downmix", () => {
  const mono = tone(440).pcm;
  const source = new DataView(mono.buffer);
  const stereo = new Uint8Array(mono.length * 2);
  const data = new DataView(stereo.buffer);
  for (let i = 0; i < mono.length / 2; i++) {
    data.setInt16(i * 4, source.getInt16(i * 2, true), true);
    data.setInt16(i * 4 + 2, source.getInt16(i * 2, true), true);
  }
  const wav = wavFromPcm16(stereo);
  const header = new DataView(wav.buffer);
  header.setUint16(22, 2, true);
  header.setUint32(28, 176400, true);
  header.setUint16(32, 4, true);
  const decoded = pcmFromWav(wav);
  expect(decoded).toEqual(mono);
  expect(auditPcm16(decoded, 69).cents).toBeCloseTo(0, 0);
  expect(() => pcmFromWav(wav.slice(0, 50))).toThrow("Invalid generated WAV");
  header.setUint32(40, wav.length * 2, true);
  expect(() => pcmFromWav(wav)).toThrow("Truncated WAV chunk");
});

test("raw response preservation cannot mutate the WAV used for validation", async () => {
  const result = await generatePcm({
    apiKey: "test-only",
    midi: 69,
    request: async () => new Response(new Uint8Array(wavFromPcm16(tone(440).pcm))),
    preserve: async (copy) => {
      copy.fill(0);
    },
  });
  expect(auditPcm16(result, 69).frequency).toBeCloseTo(440, 0);
});
