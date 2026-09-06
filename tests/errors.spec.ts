import { test, expect } from '@playwright/test'

const PAGES = [
  '/',
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

for (const url of PAGES) {
  test(`no console or page errors on ${url}`, async ({ page }) => {
    const pageErrors: string[] = []
    const consoleErrors: { text: string; url: string }[] = []
    const missingAnnotations = new Set<string>()
    page.on('response', (response) => {
      if (response.status() === 404 && new URL(response.url()).pathname.endsWith('.cluster.json')) {
        missingAnnotations.add(response.url())
      }
    })
    page.on('pageerror', (err) => pageErrors.push(`pageerror: ${err.message}`))
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return
      consoleErrors.push({ text: msg.text(), url: msg.location().url })
    })

    await page.goto(url)
    await page.waitForLoadState('networkidle')

    // Only a confirmed 404 for an optional annotation is expected. A 500,
    // network failure, or hydration error must remain visible to this gate.
    const errors = [
      ...pageErrors,
      ...consoleErrors
        .filter(
          ({ text, url }) => !(/Failed to load resource/.test(text) && missingAnnotations.has(url)),
        )
        .map(({ text }) => `console: ${text}`),
    ]
    expect(errors, `Errors on ${url}: ${errors.join(', ')}`).toHaveLength(0)
  })
}

test('no broken internal links across the site', async ({ page, browserName }) => {
  // Pure HTTP checks via page.request — engine-independent, one pass suffices.
  test.skip(browserName !== 'chromium', 'HTTP-only test, engine-independent')
  const visited = new Set<string>()
  const broken: string[] = []

  const pages = ['/', '/resume']

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
