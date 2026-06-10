import { test, expect } from '@playwright/test'

// The dark/light choice must survive both a ClientRouter navigation and a
// hard reload. daisyUI's `theme-controller` checkbox is pure CSS and forgets
// on its own; the inline script in Layout.astro restores from localStorage.
// This test guards that script — it regressed silently once (toggle worked,
// persistence didn't).

const colorScheme = (page: import('@playwright/test').Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)

test('dark theme persists across navigation and reload', async ({ page }) => {
  await page.goto('/')
  // The checkbox itself is visually hidden inside the daisyUI swap label.
  await page.locator('label[aria-label="Toggle dark mode"]').click()
  expect(await colorScheme(page)).toBe('dark')

  // ClientRouter navigation swaps in a fresh document with an unchecked
  // toggle; `astro:after-swap` must re-apply the stored theme before paint.
  await page.locator('a[href^="/research/"]').first().click()
  await page.waitForURL('**/research/**')
  expect(await colorScheme(page)).toBe('dark')
  // The sun/moon icon must match the restored theme, not the fresh checkbox.
  await expect(page.locator('input.theme-controller')).toBeChecked()

  await page.reload()
  expect(await colorScheme(page)).toBe('dark')

  // Toggling back to light must persist too (and clear the stored dark).
  await page.locator('label[aria-label="Toggle dark mode"]').click()
  await page.reload()
  expect(await colorScheme(page)).toBe('light')
})
