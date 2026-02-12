import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Also load next-app .env.local if it exists
dotenv.config({ path: path.resolve(__dirname, 'next-app/.env.local'), override: true });

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: './tests/e2e',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: 'html',
  
  // Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions.
  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    // Configurable via environment variable for local or deployed frontend.
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Load authentication state from file
    storageState: 'playwright-auth.json',

    // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    trace: 'on-first-retry',

    // Capture screenshot on test failure
    screenshot: 'only-on-failure',

    // Record video for failed tests
    video: 'retain-on-failure',

    // Headless mode for CI, headed for local debugging
    headless: !process.env.CI,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /*
  // Run your local dev server before starting the tests.
  webServer: {
    command: process.env.CI ? 'cd next-app && npm run dev' : 'echo "Using existing server"', // Skip command if not on CI
    url: 'http://localhost:3000', // URL where the Next.js dev server will be running
    reuseExistingServer: true, // Reuse server if not on CI
    timeout: 120 * 1000, // Give it more time to start
  },
  */

  // Global setup and teardown for things like database setup, authenticated state.
  // We'll point to the database-setup.js in the e2e folder.
  // globalSetup: './tests/e2e/global-setup.ts',
  // globalTeardown: './tests/e2e/global-teardown.ts',
});
