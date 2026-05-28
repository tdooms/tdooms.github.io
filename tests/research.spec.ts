import { test, expect } from '@playwright/test'

test.describe('research pages', () => {
  test('all paper cards link to reachable pages', async ({ page }) => {
    await page.goto('/research')

    const links = await page.locator('a[href^="/research/"]').all()
    expect(links.length).toBeGreaterThan(0)

    for (const link of links) {
      const href = await link.getAttribute('href')
      const response = await page.request.get(href!)
      expect(response.ok(), `${href} returned ${response.status()}`).toBeTruthy()
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

  test('author toggle expands long lists', async ({ page }) => {
    await page.goto('/research/evee')

    const summary = page.locator('details summary')
    await expect(summary).toBeVisible()
    await expect(summary).toContainText('authors')

    await summary.click()
    await expect(page.locator('details[open]')).toBeVisible()
  })
})
