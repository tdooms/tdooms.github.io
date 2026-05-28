import { test, expect } from '@playwright/test'

const PAGES = [
  '/',
  '/research',
  '/blog',
  '/resume',
  '/research/bilinear',
  '/research/evee',
  '/research/bae',
  '/research/simplestories',
]

for (const url of PAGES) {
  test(`no console errors on ${url}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto(url)
    await page.waitForLoadState('networkidle')

    expect(errors, `Console errors on ${url}: ${errors.join(', ')}`).toHaveLength(0)
  })
}

test('no broken internal links across the site', async ({ page }) => {
  const visited = new Set<string>()
  const broken: string[] = []

  const pages = ['/', '/research', '/blog', '/resume']

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
