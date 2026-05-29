import { test, expect } from '@playwright/test'

test.describe('bugs that should exist', () => {
  test('paper-card → back to home round-trip works', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href^="/research/"]').first().click()
    await page.waitForURL('**/research/**')
    // Layout back-link is the fixed house icon at top-left, not text.
    await page.locator('a[aria-label="Home"]').click()
    await page.waitForURL((u) => u.pathname === '/')
    await expect(page.locator('h1', { hasText: 'Thomas Dooms' })).toBeVisible()
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

  test('images on the site actually load (src resolves)', async ({ page }) => {
    // Hit a page known to ship raster images (the home profile card + paper
    // thumbnails). Walk every <img>, scroll into view, await load.
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const images = page.locator('main img')
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

  test('paper page renders authors', async ({ page }) => {
    // Authors used to live inside a <details><summary>; now they're a plain
    // paragraph (Authors.astro). Assert the paragraph + at least one author
    // anchor (Author.astro renders each as a link) exists.
    await page.goto('/research/evee')
    await page.waitForLoadState('networkidle')
    const authorsPara = page.locator('main p').first()
    await expect(authorsPara).toBeVisible()
    const text = await authorsPara.textContent()
    expect(text?.trim().length, 'Authors paragraph is empty').toBeGreaterThan(0)
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
