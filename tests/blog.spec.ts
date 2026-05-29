import { test, expect } from '@playwright/test'

test.describe('blog', () => {
  test('blog cards render with titles and dates', async ({ page }) => {
    await page.goto('/blog')
    // Each Blog card is an anchor whose href is either /blog/<id> (internal)
    // or an external URL. Both forms wrap an <h3> title and a <time> date.
    const cards = page.locator('main a[class*="rounded-xl"]')
    expect(await cards.count()).toBeGreaterThan(0)
    await expect(cards.first().locator('h3')).toBeVisible()
    await expect(cards.first().locator('time')).toBeVisible()
  })

  test('external blog posts open in new tab with a visible indicator', async ({ page }) => {
    await page.goto('/blog')

    const externalLinks = page.locator('main a[target="_blank"]')
    const count = await externalLinks.count()
    if (count === 0) return

    const first = externalLinks.first()
    // Indicator is the iconify-rendered "arrow-up-right-from-square" — astro-icon
    // inlines an SVG, so check on the wrapping <svg> via title/class rather than
    // the old fontawesome class.
    await expect(first.locator('svg').first()).toBeVisible()
    await expect(first).toHaveAttribute('rel', /noopener/)
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
