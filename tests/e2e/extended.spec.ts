import { expect, test } from "@playwright/test";
import topics from "../../resources/js/data/course.json" with { type: "json" };

test("58 topics, semantic construction and a complete review round persist separately", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/course?lang=en");
  await expect(page.getByTestId("course-topic")).toHaveCount(58);
  await page.getByRole("button", { name: "Mark as read", exact: true }).first().click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Marked read", exact: true })).toHaveCount(1);
  await page.getByLabel("Your written notes").fill("C D E F G A B");
  await page.getByRole("button", { name: "Check answer", exact: true }).first().click();
  await expect(page.getByRole("status").first()).toContainText("Correct.");
  await page.getByRole("button", { name: "Start a review round", exact: true }).click();
  for (let i = 0; i < 10; i++) {
    const question = page.getByTestId("course-question");
    const id = await question.getAttribute("data-question-id");
    const topic = topics.find((t) => t.id === id);
    expect(topic).toBeTruthy();
    await question.getByRole("button", { name: topic?.options.en[topic.correct], exact: true }).click();
    await question.getByRole("button", { name: i === 9 ? "Finish round" : "Next question", exact: true }).click();
  }
  await expect(page.getByText("10/10 · Practice threshold reached for this round.", { exact: true })).toBeVisible();
  await page.reload();
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("vukem-music:course:v1") ?? "{}"));
  expect(progress).toMatchObject({ attempts: 10, correct: 10, rounds: 1, best: 10 });
  expect(progress.read).toHaveLength(1);
  await page.getByLabel("Language", { exact: true }).selectOption("pt-BR");
  await expect(page.getByRole("heading", { name: "Da primeira pauta às ideias avançadas." })).toBeVisible();
  expect(errors).toEqual([]);
});

test("MusicXML SVG, simultaneous voices, pause and unsafe import rejection", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") console.log(message.text());
  });
  await page.goto("/import?lang=en");
  await page.getByRole("button", { name: "Open original polyphonic study", exact: true }).click();
  await expect(page.locator(".advanced-score svg")).not.toHaveCount(0);
  await expect(page.locator("[data-performance-note]")).not.toHaveCount(0);
  const player = page.getByTestId("advanced-player");
  await player.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator('[data-piano-midi][data-active="true"]')).toHaveCount(4);
  await expect(page.locator('[data-performance-note][data-active="true"]')).not.toHaveCount(0);
  await player.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.locator('[data-piano-midi][data-active="true"]')).toHaveCount(0);
  const time = await player.locator("output").first().textContent();
  await page.waitForTimeout(150);
  await expect(player.locator("output").first()).toHaveText(time ?? "");
  await player.getByRole("button", { name: "Stop", exact: true }).click();
  await page.getByLabel("Choose MusicXML (.musicxml or .xml, up to 2 MiB)").setInputFiles({
    name: "unsafe.musicxml",
    mimeType: "application/xml",
    buffer: Buffer.from('<!DOCTYPE score-partwise [<!ENTITY x SYSTEM "https://example.com">]><score-partwise/>'),
  });
  await expect(page.getByRole("alert")).toContainText("DTD and entity declarations are not accepted");
  expect(errors).toEqual([]);
});

test("optional account saves and restores local progress, then deletes only cloud data", async ({ page }) => {
  await page.goto("/lessons/sound-and-pitch?lang=en");
  await page.getByRole("button", { name: "Mark lesson complete", exact: true }).click();
  await page.goto("/account?lang=en");
  await page.getByLabel("Account handle", { exact: true }).fill(`study_${Date.now()}`);
  await page.getByLabel("Password", { exact: true }).fill("test-only-learning-passphrase");
  await page.getByRole("button", { name: "Create optional account", exact: true }).click();
  await expect(page.getByText("Signed in. Your local progress has not been replaced.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save progress to account", exact: true }).click();
  await expect(page.getByText("Progress saved to your account.", { exact: true })).toBeVisible();
  await page.evaluate(() => localStorage.removeItem("vukem-music:progress:v1"));
  await page.reload();
  page.on("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: "Restore progress from account", exact: true }).click();
  await expect(page.getByText("Progress restored in this browser.", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("vukem-music:progress:v1") ?? "{}").completed),
  ).toContain("sound-and-pitch");
  await page.getByLabel("Confirm password to delete account").fill("test-only-learning-passphrase");
  await page.getByRole("button", { name: "Delete account and cloud progress", exact: true }).click();
  await expect(
    page.getByText("Account and cloud progress deleted. Local progress remains.", { exact: true }),
  ).toBeVisible();
  await page.goto("/progress?lang=en");
  await expect(page.getByText("1/8", { exact: true }).first()).toBeVisible();
});

test("MIDI sustain, repeated attacks, blur and disconnect leave no held voices", async ({ page }) => {
  await page.addInitScript(() => {
    const input: {
      id: string;
      name: string;
      state: string;
      onmidimessage: ((e: { data: Uint8Array }) => void) | null;
      close: () => Promise<void>;
    } = { id: "virtual-piano", name: "Virtual piano", state: "connected", onmidimessage: null, close: async () => {} };
    const access: { inputs: Map<string, typeof input>; onstatechange: (() => void) | null } = {
      inputs: new Map([[input.id, input]]),
      onstatechange: null,
    };
    Object.defineProperty(navigator, "requestMIDIAccess", { configurable: true, value: async () => access });
    (
      window as unknown as {
        midiHarness: { send: (bytes: number[]) => void; disconnect: () => void; attached: () => boolean };
      }
    ).midiHarness = {
      send: (bytes) => input.onmidimessage?.({ data: new Uint8Array(bytes) }),
      disconnect: () => {
        input.state = "disconnected";
        access.onstatechange?.();
      },
      attached: () => input.onmidimessage !== null,
    };
  });
  type Harness = { midiHarness: { send: (bytes: number[]) => void; disconnect: () => void; attached: () => boolean } };
  await page.goto("/instruments?lang=en");
  await page.getByRole("button", { name: "Connect MIDI keyboard", exact: true }).click();
  await expect(page.getByText("Virtual piano", { exact: true })).toBeVisible();
  await page.evaluate(() => {
    const h = (window as unknown as Harness).midiHarness;
    h.send([0x90, 60, 110]);
    h.send([0xb0, 64, 127]);
    h.send([0x80, 60, 0]);
  });
  await expect(page.locator('[data-piano-midi="60"]')).toHaveAttribute("data-active", "true");
  await page.evaluate(() => (window as unknown as Harness).midiHarness.send([0xb0, 64, 0]));
  await expect(page.locator('[data-piano-midi][data-active="true"]')).toHaveCount(0);
  await page.evaluate(() => {
    const h = (window as unknown as Harness).midiHarness;
    h.send([0x90, 64, 90]);
    h.send([0x90, 64, 100]);
  });
  await expect(page.locator('[data-piano-midi][data-active="true"]')).toHaveCount(1);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(page.locator('[data-piano-midi][data-active="true"]')).toHaveCount(0);
  await page.evaluate(() => (window as unknown as Harness).midiHarness.send([0x90, 67, 100]));
  await expect(page.locator('[data-piano-midi][data-active="true"]')).toHaveCount(0);
  await page.evaluate(() => {
    window.dispatchEvent(new Event("focus"));
    (window as unknown as Harness).midiHarness.send([0x90, 69, 100]);
  });
  await expect(page.locator('[data-piano-midi][data-active="true"]')).toHaveCount(1);
  await page.evaluate(() => (window as unknown as Harness).midiHarness.disconnect());
  await expect(page.locator('[data-piano-midi][data-active="true"]')).toHaveCount(0);
  await expect(page.getByText("MIDI enabled; no input device connected.", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Full theory course", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as Harness).midiHarness.attached())).toBe(false);
});

test("microphone is opt-in, estimates a local tone and releases tracks on stop", async ({ page }) => {
  await page.addInitScript(() => {
    const harness = { requests: 0, stops: 0 };
    (window as unknown as { micHarness: typeof harness }).micHarness = harness;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          harness.requests++;
          const audio = new AudioContext();
          await audio.resume();
          const oscillator = audio.createOscillator();
          oscillator.frequency.value = 440;
          const gain = audio.createGain();
          gain.gain.value = 0.3;
          const destination = audio.createMediaStreamDestination();
          oscillator.connect(gain);
          gain.connect(destination);
          oscillator.start();
          const stream = destination.stream;
          for (const track of stream.getTracks()) {
            const stop = track.stop.bind(track);
            track.stop = () => {
              harness.stops++;
              stop();
              oscillator.stop();
              void audio.close();
            };
          }
          return stream;
        },
      },
    });
  });
  type Harness = { micHarness: { requests: number; stops: number } };
  await page.goto("/instruments?lang=en");
  expect(await page.evaluate(() => (window as unknown as Harness).micHarness.requests)).toBe(0);
  await page.getByRole("button", { name: "Enable microphone", exact: true }).click();
  await expect(page.locator("output")).toContainText("A4", { timeout: 10000 });
  await page.getByRole("button", { name: "Stop microphone", exact: true }).click();
  await expect(page.locator("output")).toHaveText("Microphone off");
  expect(await page.evaluate(() => (window as unknown as Harness).micHarness)).toEqual({ requests: 1, stops: 1 });
});

test("licensed repertoire edition highlights its SVG and simultaneous piano pitches", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  expect((await page.request.get("/library/reinagle-op1-05")).status()).toBe(404);
  expect((await page.request.get("/generated-scores/reinagle-op1-05.json")).status()).toBe(404);
  await page.goto("/library/mozart-k2?lang=en");
  await expect(page.locator(".native-score svg")).not.toHaveCount(0);
  await expect(page.locator("[data-source]")).not.toHaveCount(0);
  const player = page.getByTestId("advanced-player");
  await player.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator('[data-source][data-active="true"]')).not.toHaveCount(0);
  await expect(page.locator('[data-piano-midi][data-active="true"]')).not.toHaveCount(0);
  await player.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.locator('[data-piano-midi][data-active="true"]')).toHaveCount(0);
  await page.screenshot({ path: "test-results/native-library.png", fullPage: true });
  await page.getByLabel("Language", { exact: true }).selectOption("pt-BR");
  await expect(page.locator(".native-score svg")).not.toHaveCount(0);
  expect(errors).toEqual([]);
});
