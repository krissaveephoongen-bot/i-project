import { defineConfig, devices } from "@playwright/test";

const productionURL =
  process.env.PLAYWRIGHT_BASE_URL || "https://i-projects.skin";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 120_000,
  reporter: "line",
  use: {
    baseURL: productionURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
