/**
 * playwright.config.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Playwright configuration for portfolio2026 visual regression tests.
 *
 * Runs against the local dev server (npm start must be running).
 * Tests Chromium and WebKit (Safari engine) in parallel.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,

  // Run tests in both Chromium and WebKit simultaneously
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Output
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/report', open: 'never' }],
  ],

  use: {
    // Base URL — requires npm start to be running
    baseURL: 'http://localhost:8080',

    // Always capture screenshots on failure
    screenshot: 'only-on-failure',

    // Ignore HTTPS errors (not needed for localhost but good practice)
    ignoreHTTPSErrors: true,
  },
});
