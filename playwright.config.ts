import { randomBytes } from "node:crypto";
import { defineConfig } from "@playwright/test";

const port = Number(process.env.E2E_PORT || 3000);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid E2E_PORT");
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
  webServer: {
    command: "go run ./cmd/app migrate && go run ./cmd/app",
    env: {
      APP_KEY: process.env.APP_KEY?.trim() || `base64:${randomBytes(32).toString("base64")}`,
      PORT: String(port),
      DATABASE_URL: "file:storage/e2e.sqlite",
    },
    url: `${baseURL}/up`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
