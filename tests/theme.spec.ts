import { test, expect } from '@playwright/test'

// The toggle and page colors must follow the saved choice across document
// loads and browser history, including restoration from the document cache.

const colorScheme = (page: import('@playwright/test').Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)

test('dark theme persists across navigation and reload', async ({ page }) => {
  await page.goto('/')
  // The checkbox itself is visually hidden inside the daisyUI swap label.
  await page.locator('label[aria-label="Toggle dark mode"]').click()
  expect(await colorScheme(page)).toBe('dark')

  await page.locator('a[href^="/research/"]').first().click()
  await page.waitForURL('**/research/**')
  const paperURL = page.url()
  expect(await colorScheme(page)).toBe('dark')
  // The sun/moon icon must match the restored theme, not the fresh checkbox.
  await expect(page.locator('input.theme-controller')).toBeChecked()

  await page.reload()
  expect(await colorScheme(page)).toBe('dark')

  // Toggling back to light must persist too (and clear the stored dark).
  await page.locator('label[aria-label="Toggle dark mode"]').click()
  await page.reload()
  expect(await colorScheme(page)).toBe('light')

  // Home was dark when we left it. Back must pick up the newer light choice.
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Thomas Dooms' })).toBeVisible()
  expect(await colorScheme(page)).toBe('light')
  await expect(page.locator('input.theme-controller')).not.toBeChecked()
  await page.locator('label[aria-label="Toggle dark mode"]').click()
  await page.goForward()
  await expect(page).toHaveURL(paperURL)
  expect(await colorScheme(page)).toBe('dark')
  await expect(page.locator('input.theme-controller')).toBeChecked()
})
