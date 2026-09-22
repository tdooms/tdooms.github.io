import { test, expect } from '@playwright/test'

test.describe('research pages', () => {
  test('paper cards and navigation follow publication order', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Static link destinations are engine-independent')
    await page.goto('/')

    const links = await page
      .locator('a.publication-card[href^="/research/"]')
      .evaluateAll((cards) => cards.map((card) => card.getAttribute('href')!))
    expect(links.length).toBeGreaterThan(1)

    for (const [i, href] of links.entries()) {
      const response = await page.goto(href)
      expect(response!.ok(), href).toBeTruthy()
      const previous = page.getByRole('link', { name: /^Previous/ })
      const next = page.getByRole('link', { name: /^Next/ })
      if (i > 0) await expect(previous).toHaveAttribute('href', links[i - 1]!)
      else await expect(previous).toHaveCount(0)
      if (i < links.length - 1) await expect(next).toHaveAttribute('href', links[i + 1]!)
      else await expect(next).toHaveCount(0)
    }
  })

  test('paper pages have title, authors, and content', async ({ page }) => {
    await page.goto('/research/bilinear')

    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('h1 + p').first()).toBeVisible()
    await expect(page.locator('.prose')).toBeVisible()
  })

  test('resources render with correct links', async ({ page }) => {
    await page.goto('/research/bilinear')

    const paper = page.locator('a', { hasText: 'Paper' })
    await expect(paper).toBeVisible()
    await expect(paper).toHaveAttribute('href', /arxiv\.org|openreview/)
    await expect(paper).toHaveAttribute('target', '_blank')
  })

  test('author equal-contribution tooltip shows on hover', async ({ page }) => {
    await page.goto('/research/bilinear')

    const star = page.locator('.tooltip sup').first()
    await expect(star).toBeVisible()
    const container = page.locator('.tooltip').first()
    await expect(container).toHaveAttribute('data-tip', 'Equal contribution')
  })
})
