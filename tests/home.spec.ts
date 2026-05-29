import { test, expect } from '@playwright/test'

test.describe('homepage', () => {
  test('profile card renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1', { hasText: 'Thomas Dooms' })).toBeVisible()
    // Tagline text is owner-editable; assert presence of "PhD" + "interpretability"
    // separately so future copy tweaks don't break this.
    await expect(page.getByText(/PhD/i).first()).toBeVisible()
    await expect(page.getByText(/interpretability/i).first()).toBeVisible()
  })

  test('social links have correct targets', async ({ page }) => {
    await page.goto('/')
    const github = page.locator('a[href*="github.com/tdooms"]')
    await expect(github).toBeVisible()
  })

  test('news section renders entries', async ({ page }) => {
    await page.goto('/')
    // News.astro renders each entry's title in an <h3>. Scope to the News
    // section heading's parent so we don't pick up titles elsewhere.
    const newsSection = page.locator('section', { has: page.locator('h2', { hasText: 'News' }) })
    await expect(newsSection).toBeVisible()
    const entries = newsSection.locator('h3')
    expect(await entries.count()).toBeGreaterThan(0)
  })
})
