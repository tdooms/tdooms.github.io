import { test, expect } from '@playwright/test'

const PAGES = [
  '/',
  '/blog',
  '/blog/tensors',
  '/resume',
  '/research/bilinear',
  '/research/evee',
  '/research/bae',
  '/bae',
  // Composite 1627 exercises the full Atlas data path (feather + meta fetch,
  // WebGL scene). It deliberately has no cluster.json on the bucket — that
  // 404 is handled in code and allowlisted below.
  '/bae/?composite=1627',
  '/research/simplestories',
]

// Console errors we accept. `latent_*.cluster.json` is an optional resource:
// the loader fetches it with `.catch(() => null)`, but the browser still logs
// the 404 as a console error. Everything else fails the test — including
// island hydration failures ("[astro-island] Error hydrating ..."), which are
// console errors rather than pageerrors and would otherwise slip through.
const isAllowed = (text: string, url: string | undefined): boolean =>
  /Failed to load resource/.test(text) && /\.cluster\.json/.test(url ?? '')

for (const url of PAGES) {
  test(`no console or page errors on ${url}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return
      if (isAllowed(msg.text(), msg.location().url)) return
      errors.push(`console: ${msg.text()}`)
    })

    await page.goto(url)
    await page.waitForLoadState('networkidle')

    expect(errors, `Errors on ${url}: ${errors.join(', ')}`).toHaveLength(0)
  })
}

test('no broken internal links across the site', async ({ page, browserName }) => {
  // Pure HTTP checks via page.request — engine-independent, one pass suffices.
  test.skip(browserName !== 'chromium', 'HTTP-only test, engine-independent')
  const visited = new Set<string>()
  const broken: string[] = []

  const pages = ['/', '/blog', '/resume']

  for (const url of pages) {
    await page.goto(url)
    const links = await page.locator('a[href^="/"]').all()

    for (const link of links) {
      const href = await link.getAttribute('href')
      if (!href || visited.has(href) || href.startsWith('/#')) continue
      visited.add(href)

      const response = await page.request.get(href)
      if (!response.ok()) {
        broken.push(`${href} (${response.status()}) from ${url}`)
      }
    }
  }

  expect(broken, `Broken links: ${broken.join('\n')}`).toHaveLength(0)
})
