import { defineConfig, devices } from '@playwright/test'

const previewPort = Number(process.env.PLAYWRIGHT_PORT ?? 4328)
const baseURL = `http://127.0.0.1:${previewPort}/`

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Pin to one worker in CI; locally omit the key so Playwright auto-scales.
  // (Under exactOptionalPropertyTypes an explicit `undefined` is rejected.)
  ...(process.env.CI ? { workers: 1 } : {}),
  webServer: {
    command: `bun run build && bun run preview -- --host 127.0.0.1 --port ${previewPort}`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: false,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
