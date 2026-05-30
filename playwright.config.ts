import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  // Per-test timeout. The Next.js dev server compiles routes on first hit,
  // and the first page load for each route can take 10-30s on a cold cache.
  timeout: 90_000,
  expect: {
    // Default 5s is too short while the dev server is still compiling
    // the route under test. Give locators plenty of room.
    timeout: 30_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // Navigations during dev-mode compilation can be slow.
    navigationTimeout: 60_000,
    actionTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    // Cold `next dev` boot on this repo is well past 60s; allow up to 3 min.
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
