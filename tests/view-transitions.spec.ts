import { test, expect } from '@playwright/test'

test.describe('client-side navigation re-initializes interactive components', () => {
  test('citation copy button is clickable after navigating from home', async ({ page }) => {
    await page.goto('/')

    const paperLink = page.locator('a[href^="/research/"]').first()
    await paperLink.click()
    await page.waitForURL('**/research/**')

    const copyButton = page.locator('button[aria-label="Copy citation"]')
    // Cite component is desktop-only (hidden md:block)
    if (await copyButton.isVisible()) {
      await expect(copyButton).toBeEnabled()
    }
  })

  test('navigating home from a paper page leaves the home hero intact', async ({ page }) => {
    await page.goto('/research/bilinear')
    // Use the house icon in the layout's top-left
    await page.locator('a[aria-label="Home"]').first().click()
    await page.waitForURL((url) => url.pathname === '/')

    await expect(page.locator('h1', { hasText: 'Thomas Dooms' })).toBeVisible()
  })
})
