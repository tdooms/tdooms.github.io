import { test, expect } from '@playwright/test'

test.describe('bugs that should exist', () => {
  test('news load-more works after navigating away and back', async ({ page }) => {
    await page.goto('/')
    // Navigate to a paper via the compact card
    await page.locator('a[href^="/research/"]').first().click()
    await page.waitForURL('**/research/**')
    // Navigate back via the Layout back-link
    await page.locator('a[href="/"]', { hasText: 'Thomas Dooms' }).click()
    await page.waitForURL('**/')

    const loadMore = page.locator('#load-more-btn')
    if (!(await loadMore.isVisible())) return

    const hiddenBefore = await page.locator('.news-item.hidden').count()
    await loadMore.click()
    const hiddenAfter = await page.locator('.news-item.hidden').count()
    expect(hiddenAfter).toBeLessThan(hiddenBefore)
  })

  test('external links have rel="noopener" for security', async ({ page }) => {
    await page.goto('/blog')
    const externalLinks = page.locator('a[target="_blank"]')
    const count = await externalLinks.count()

    for (let i = 0; i < count; i++) {
      const rel = await externalLinks.nth(i).getAttribute('rel')
      const href = await externalLinks.nth(i).getAttribute('href')
      expect(rel, `${href} missing rel="noopener"`).toContain('noopener')
    }
  })

  test('all resource links resolve (no 404 PDFs or dead arxiv links)', async ({ page }) => {
    await page.goto('/research/bilinear')
    const resourceLinks = page.locator('a[target="_blank"][href^="http"]')
    const count = await resourceLinks.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const href = await resourceLinks.nth(i).getAttribute('href')
      const response = await page.request.get(href!)
      expect(response.status(), `${href} returned ${response.status()}`).toBeLessThan(400)
    }
  })

  test('images in blog cards actually load (src resolves)', async ({ page }) => {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')

    const images = page.locator('.card img')
    const count = await images.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      await img.scrollIntoViewIfNeeded()
      const loaded = await img.evaluate(
        (el: HTMLImageElement) =>
          new Promise<boolean>((resolve) => {
            if (el.complete) return resolve(el.naturalWidth > 0)
            el.addEventListener('load', () => resolve(el.naturalWidth > 0), { once: true })
            el.addEventListener('error', () => resolve(false), { once: true })
          }),
      )
      const src = await img.getAttribute('src')
      expect(loaded, `Image failed to load: ${src}`).toBe(true)
    }
  })

  test('interactive elements have accessible labels', async ({ page }) => {
    await page.goto('/')

    // Load-more button should have accessible text
    const loadMore = page.locator('#load-more-btn')
    if (await loadMore.isVisible()) {
      const text = await loadMore.textContent()
      expect(text?.trim().length).toBeGreaterThan(0)
    }

    // Navigate to a paper with authors
    await page.goto('/research/evee')
    const summary = page.locator('details summary')
    const text = await summary.textContent()
    expect(text?.trim()).toMatch(/\d+ authors/)
  })

  test('cite button copies bibtex to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/research/bilinear')

    const copyButton = page.locator('button[aria-label="Copy citation"]')
    if (!(await copyButton.isVisible())) return

    await copyButton.click()
    const clipboard = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboard).toContain('@')
    expect(clipboard).toContain('title')
  })
})
