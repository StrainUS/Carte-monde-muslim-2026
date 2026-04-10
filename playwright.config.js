// @ts-check
/* Navigateurs dans node_modules (reproductible Mac/Win/Linux après `npx playwright install`) */
if (process.env.PLAYWRIGHT_BROWSERS_PATH === undefined) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
}
const { defineConfig, devices } = require("@playwright/test");

const PORT = process.env.E2E_PORT || 5876;
const baseURL = `http://127.0.0.1:${PORT}`;

module.exports = defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 45_000,
  },
});
