/**
 * Playwright Configuration for E2E Testing
 * Tests the Electron app UI and user interactions
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Electron tests should run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for Electron
  reporter: [
    ['html'],
    ['list']
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  projects: [
    {
      name: 'electron',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ],
  outputDir: 'test-results'
});
