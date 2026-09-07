import { defineConfig, devices } from '@playwright/test'

/**
 * These tests run against a production build, not the dev server — several of
 * the things they check (static generation, cache headers, the real GSAP
 * bundle) only behave correctly in `next start`.
 *
 * PLAYWRIGHT_CHROMIUM_PATH lets a sandbox point at a preinstalled browser;
 * everywhere else Playwright uses its own.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',

  use: {
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },

  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run build && npm run start -- --port 3000',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
})
