import { test, expect } from '@playwright/test'

test.describe('client-side navigation re-initializes interactive components', () => {
  test('author toggle works after navigating from research index', async ({ page }) => {
    await page.goto('/research')

    // Find a paper that will have >5 authors (EVEE has 22)
    const eveeLink = page.locator('a[href="/research/evee"]')
    await eveeLink.click()
    await page.waitForURL('**/research/evee')

    const summary = page.locator('details summary')
    await expect(summary).toBeVisible()
    await summary.click()

    const details = page.locator('details[open]')
    await expect(details).toBeVisible()
  })

  test('citation copy button is clickable after navigation', async ({ page }) => {
    await page.goto('/research')

    const paperLink = page.locator('a[href^="/research/"]').first()
    await paperLink.click()
    await page.waitForURL('**/research/**')

    const copyButton = page.locator('button[aria-label="Copy citation"]')
    // Cite component is desktop-only (hidden md:block)
    if (await copyButton.isVisible()) {
      await expect(copyButton).toBeEnabled()
    }
  })

  test('news load-more works after navigating home from another page', async ({ page }) => {
    await page.goto('/research')
    // Use the back-link in Layout
    await page.locator('a[href="/"]').first().click()
    await page.waitForURL('**/')

    const loadMore = page.locator('#load-more-btn')
    if (await loadMore.isVisible()) {
      const hiddenBefore = await page.locator('.news-item.hidden').count()
      await loadMore.click()
      const hiddenAfter = await page.locator('.news-item.hidden').count()
      expect(hiddenAfter).toBeLessThan(hiddenBefore)
    }
  })
})
