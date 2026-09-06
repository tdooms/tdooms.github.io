import { test, expect } from '@playwright/test'

test.describe('blog', () => {
  test('blog cards render with titles and dates', async ({ page }) => {
    await page.goto('/#blog')
    // Each Blog card is an anchor wrapping an <h3> title and a <time> date —
    // match on that structure, not on a styling class (which the card markup
    // may change).
    const cards = page.locator('#blog a:has(h3):has(time)')
    expect(await cards.count()).toBeGreaterThan(0)
    await expect(cards.first().locator('h3')).toBeVisible()
    await expect(cards.first().locator('time')).toBeVisible()
  })

  test('external blog posts open in new tab with a visible indicator', async ({ page }) => {
    await page.goto('/#blog')

    const externalLinks = page.locator('#blog a[target="_blank"]')
    const count = await externalLinks.count()
    expect(count).toBeGreaterThan(0)

    const first = externalLinks.first()
    // Indicator is the iconify-rendered "arrow-up-right-from-square" — astro-icon
    // inlines an SVG, so check on the wrapping <svg> via title/class rather than
    // the old fontawesome class.
    await expect(first.locator('svg').first()).toBeVisible()
    await expect(first).toHaveAttribute('rel', /noopener/)
  })

  test('post home icons return to the homepage blog section', async ({ page }) => {
    for (const width of [375, 1280]) {
      await page.setViewportSize({ width, height: 812 })
      for (const name of ['Home', 'Back to home']) {
        await page.goto('/#blog')
        const post = page.locator('#blog a[href^="/blog/"]:not([target="_blank"])').first()
        const href = await post.getAttribute('href')
        await post.click()
        await page.waitForURL(`**${href}`)

        const home = page.getByRole('link', { name, exact: true })
        await expect(home).toHaveAttribute('href', '/#blog')
        await expect(home).toHaveText('')
        await expect(home.locator('svg')).toBeVisible()
        await home.click()
        await expect(page).toHaveURL(/\/#blog$/)
        await expect(page.locator('#blog h2')).toBeInViewport()
      }
    }
  })
})
