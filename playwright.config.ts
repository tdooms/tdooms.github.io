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
    // Pipe the server's own output into Playwright's. Without this, a dying
    // `build`/`preview` inside the webServer reads as a silent 120 s poll
    // timeout with zero diagnostics (exactly how the CI deploys broke).
    stdout: 'pipe',
    stderr: 'pipe',
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  // Chromium is the always-on project — the local loop (and the Stop hook,
  // which runs the suite on every stop) stays fast. Firefox + WebKit run in
  // CI, or locally via CROSS_BROWSER=1 (`$env:CROSS_BROWSER='1'; bun run test`).
  // Running all three locally by default tripled the suite and WebKit-on-
  // Windows wedged under parallel load.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ...(process.env.CI || process.env.CROSS_BROWSER
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        ]
      : []),
  ],
})
