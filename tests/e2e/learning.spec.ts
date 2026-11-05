import { expect, test } from "@playwright/test";

test("bilingual learning, original exercise and persistent progress", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?lang=en");
  await expect(page.getByRole("heading", { name: "Make sense of every note." })).toBeVisible();
  await page.getByRole("link", { name: "Start learning", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Meet the sound", exact: true })).toBeVisible();
  await expect(page.locator("[data-piano-midi]")).toHaveCount(88);
  await page.getByTestId("exercise").getByRole("button", { name: "C4", exact: true }).click();
  await expect(page.getByText("Exactly right.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Try another note", exact: true }).click();
  // The next target is D4. A piano answer is evaluated without a separate keyboard.
  await page.locator('[data-piano-midi="62"]').click();
  await expect(page.getByText("Exactly right. That is D4.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Try another note", exact: true }).click();
  await page.getByTestId("exercise").getByRole("button", { name: "D4", exact: true }).click();
  await expect(page.getByText("Not quite. The written note is E4.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mark lesson complete", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Completed", exact: true })).toBeDisabled();
  await page.getByLabel("Language", { exact: true }).selectOption("pt-BR");
  await expect(page.getByRole("heading", { name: "Conheça o som", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await page.getByRole("link", { name: "Seu progresso", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Cada pequeno passo conta." })).toBeVisible();
  await expect(page.getByText("1/8", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("67%", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("audio clock synchronizes score and piano; pause, tempo and stop reset correctly", async ({ page }) => {
  await page.goto("/practice?lang=en");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  await expect(page.locator('[data-event-id="sound-and-pitch-0"]')).toHaveAttribute("data-active", "true");
  await expect(page.locator('[data-piano-midi="60"]')).toHaveAttribute("data-active", "true");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.locator('[data-piano-midi][data-active="true"]')).toHaveCount(0);
  const time = await page.getByTestId("player").locator("output").first().textContent();
  await page.waitForTimeout(150);
  await expect(page.getByTestId("player").locator("output").first()).toHaveText(time ?? "");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.getByTestId("player").locator("output").first()).toContainText("0.0 /");
  await page.getByLabel("Tempo", { exact: true }).fill("160");
  await expect(page.getByTestId("player").locator("output").first()).toHaveText("0.0 / 3.0s");
  await page.getByLabel("Choose a study").selectOption("rhythm-and-rests");
  await expect(page.locator('[data-event-id="rhythm-and-rests-1"]')).toHaveAttribute("data-midi", "rest");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator('[data-event-id="rhythm-and-rests-1"]')).toHaveAttribute("data-active", "true", {
    timeout: 6000,
  });
  await expect(page.locator('[data-piano-midi][data-active="true"]')).toHaveCount(0);
});

test("mobile navigation, dark preference and keyboard piano", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/practice?lang=en");
  await expect(page.getByRole("heading", { name: "Room to explore." })).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.getByRole("button", { name: "Toggle navigation", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Toggle light or dark theme" }).click();
  const dark = await page.locator("html").evaluate((html) => html.classList.contains("dark"));
  await page.reload();
  expect(await page.locator("html").evaluate((html) => html.classList.contains("dark"))).toBe(dark);
  await page.locator('[data-piano-midi="60"]').focus();
  await page.keyboard.down("Enter");
  await expect(page.locator('[data-piano-midi="60"]')).toHaveAttribute("data-active", "true");
  await page.keyboard.up("Enter");
  await expect(page.locator('[data-piano-midi="60"]')).toHaveAttribute("data-active", "false");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-piano-midi="61"]')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("corrupt local state recovers without breaking the learning interface", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("vukem-music:progress:v1", "not-json"));
  await page.goto("/progress?lang=en");
  await expect(page.getByRole("heading", { name: "Every small step counts." })).toBeVisible();
  await expect(page.getByText("0/8", { exact: true }).first()).toBeVisible();
});

test("score library filters 50 works and harmony plays spelled chord inversions", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/library?lang=en");
  await expect(page.getByTestId("repertoire-work")).toHaveCount(50);
  await page.screenshot({ path: test.info().outputPath("library-desktop.png") });
  await page.getByLabel("Search title or composer").fill("Petzold");
  await expect(page.getByTestId("repertoire-work")).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Open score PDF" }).first()).toHaveAttribute(
    "href",
    /^https:\/\/www.mutopiaproject.org\//,
  );
  await page.getByLabel("Search title or composer").fill("");
  await page.getByRole("combobox", { name: "Difficulty", exact: true }).selectOption("0");
  await expect(page.getByTestId("repertoire-work")).toHaveCount(7);
  await page.getByRole("link", { name: "Chords & harmony", exact: true }).click();
  await expect(page.getByTestId("chord-notes")).toHaveText("C4 – E4 – G4");
  await page.getByRole("combobox", { name: "Inversion", exact: true }).selectOption("2");
  await expect(page.getByTestId("chord-notes")).toHaveText("G4 – C5 – E5");
  await page.screenshot({ path: test.info().outputPath("harmony-desktop.png") });
  await page.getByRole("button", { name: "Play chord", exact: true }).click();
  await expect(page.locator('[data-piano-midi][data-active="true"]')).toHaveCount(3);
  for (const midi of [67, 72, 76])
    await expect(page.locator(`[data-piano-midi="${midi}"]`)).toHaveAttribute("data-active", "true");
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.locator('[data-piano-midi][data-active="true"]')).toHaveCount(0);
  await page.getByLabel("Chord quality").selectOption("diminished7");
  await expect(page.getByTestId("chord-notes")).toHaveText("C4 – E♭4 – G♭4 – B𝄫4");
  await page.getByLabel("Language", { exact: true }).selectOption("pt-BR");
  await expect(page.getByTestId("chord-notes")).toHaveText("Dó4 – Mi♭4 – Sol♭4 – Si𝄫4");
  await expect(page.getByRole("heading", { name: "Modulação com acorde pivô", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath("harmony-mobile.png") });
  await page.getByRole("combobox", { name: "Fundamental", exact: true }).selectOption("B");
  await page.getByRole("combobox", { name: "Qualidade do acorde", exact: true }).selectOption("dominant7");
  await page.getByRole("combobox", { name: "Inversão", exact: true }).selectOption("3");
  await expect(page.getByTestId("chord-notes")).toHaveText("Lá5 – Si5 – Ré♯6 – Fá♯6");
  await page.screenshot({ path: test.info().outputPath("harmony-high-chord.png") });
  expect(errors).toEqual([]);
});
