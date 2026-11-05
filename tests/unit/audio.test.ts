import { expect, test } from "bun:test";
import { validSample } from "../../resources/js/music/audio";
import { frequency } from "../../resources/js/music/theory";
import { auditPcm16, estimatePitch, generatePcm, wavFromPcm16 } from "../../scripts/lib/piano-samples";

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

test("ElevenLabs integration keeps key in header and requests isolated bounded PCM", async () => {
  let calls = 0;
  const request = async (url: string | URL | Request, options: RequestInit) => {
    calls++;
    expect(String(url)).toContain("output_format=pcm_44100");
    expect((options.headers as Record<string, string>)["xi-api-key"]).toBe("test-only");
    const body = JSON.parse(options.body as string);
    expect(body.duration_seconds).toBe(3);
    expect(body.model_id).toBe("eleven_text_to_sound_v3");
    return new Response(tone(440).pcm);
  };
  expect((await generatePcm({ apiKey: "test-only", midi: 69, request })).length).toBe(88200);
  expect(calls).toBe(1);
  const fail = async () => new Response("rate limited", { status: 429 });
  await expect(generatePcm({ apiKey: "test-only", midi: 69, request: fail })).rejects.toThrow("429");
  await expect(generatePcm({ apiKey: "", midi: 69, request })).rejects.toThrow("required");
});
