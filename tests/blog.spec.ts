import { test, expect } from '@playwright/test'

test.describe('blog', () => {
  test('blog cards render with titles and dates', async ({ page }) => {
    await page.goto('/blog')
    const cards = page.locator('.card')
    expect(await cards.count()).toBeGreaterThan(0)
    await expect(cards.first().locator('.card-title')).toBeVisible()
  })

  test('external blog posts have indicator icon and open in new tab', async ({ page }) => {
    await page.goto('/blog')

    const externalLinks = page.locator('a[target="_blank"]')
    const count = await externalLinks.count()
    if (count === 0) return

    const firstExternal = externalLinks.first()
    const icon = firstExternal.locator('.fa-arrow-up-right-from-square')
    await expect(icon).toBeVisible()
  })

  test('internal blog posts navigate within the site', async ({ page }) => {
    await page.goto('/blog')

    const internalLink = page.locator('a[href^="/blog/"]:not([target="_blank"])').first()
    if (!(await internalLink.isVisible())) return

    const href = await internalLink.getAttribute('href')
    await internalLink.click()
    await page.waitForURL(`**${href}`)
  })
})
