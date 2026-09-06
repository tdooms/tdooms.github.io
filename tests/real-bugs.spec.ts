import { test, expect } from '@playwright/test'

test.describe('site behavior regressions', () => {
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
    await page.goto('/#blog')
    const externalLinks = page.locator('#blog a[target="_blank"]')
    const count = await externalLinks.count()

    for (let i = 0; i < count; i++) {
      const rel = await externalLinks.nth(i).getAttribute('rel')
      const href = await externalLinks.nth(i).getAttribute('href')
      expect(rel, `${href} missing rel="noopener"`).toContain('noopener')
    }
  })

  test('all resource links resolve (no 404 PDFs or dead arxiv links)', async ({
    page,
    browserName,
  }) => {
    // Pure HTTP checks via page.request — nothing engine-specific. One pass
    // is enough; per-browser repeats just triple the external-host flake.
    test.skip(browserName !== 'chromium', 'HTTP-only test, engine-independent')
    await page.goto('/research/bilinear')
    const resourceLinks = page.locator('a[target="_blank"][href^="http"]')
    const count = await resourceLinks.count()
    expect(count).toBeGreaterThan(0)

    // External hosts (github, arxiv) intermittently drop the socket mid-request
    // ("socket hang up"). Retry only on *thrown* network errors — never on a
    // received HTTP response, so a real 404/500 dead link still fails the test.
    const getWithRetry = async (href: string, attempts = 3) => {
      for (let attempt = 1; ; attempt++) {
        try {
          return await page.request.get(href, { timeout: 15_000 })
        } catch (err) {
          if (attempt >= attempts) throw err
          await new Promise((r) => setTimeout(r, 500 * attempt))
        }
      }
    }

    for (let i = 0; i < count; i++) {
      const href = await resourceLinks.nth(i).getAttribute('href')
      const response = await getWithRetry(href!)
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
    await page.goto('/research/evee')
    const authorsPara = page.locator('main h1 + p')
    await expect(authorsPara).toBeVisible()
    for (const author of ['Michael T. Pearce', 'Thomas Dooms', 'Nicholas K. Wang']) {
      await expect(authorsPara).toContainText(author)
    }
  })

  test('cite button copies the paper citation on a phone after navigation from home', async ({
    page,
    context,
    browserName,
  }) => {
    // grantPermissions for the clipboard is Chromium-only in Playwright;
    // Firefox/WebKit throw "Unknown permission".
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only')
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.locator('a.card[href="/research/bilinear"]').click()
    await expect(page).toHaveURL(/\/research\/bilinear\/?$/)

    const copyButton = page.getByRole('button', { name: 'Copy citation' })
    await expect(copyButton).toBeVisible()

    await copyButton.click()
    await expect(page.locator('.cite-status')).toHaveText('Citation copied.')
    const clipboard = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboard).toBe(await page.locator('.cite-content').textContent())
    expect(clipboard).toContain('@misc{pearce2025bilinearmlpsenableweightbased,')
    expect(clipboard).toContain(
      'title={Bilinear MLPs enable weight-based mechanistic interpretability}',
    )
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)
  })

  test('clipboard rejection reports a recoverable failure and keeps the citation available', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: () => Promise.reject(new DOMException('Clipboard denied', 'NotAllowedError')),
        },
      })
    })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/research/bilinear')
    const citation = page.locator('.cite-content')
    const original = await citation.textContent()
    const copyButton = page.getByRole('button', { name: 'Copy citation' })
    await expect(copyButton).toBeVisible()
    await copyButton.click()
    await expect(page.getByRole('status')).toHaveText('Copy failed. Select the citation below.')
    await expect(copyButton).toBeEnabled()
    await expect(citation).toBeVisible()
    expect(await citation.textContent()).toBe(original)
    expect(errors).toEqual([])

    await page.evaluate(() => {
      navigator.clipboard.writeText = async () => {}
    })
    await copyButton.click()
    await expect(page.getByRole('status')).toHaveText('Citation copied.')
  })
})
