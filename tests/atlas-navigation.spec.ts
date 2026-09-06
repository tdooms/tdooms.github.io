import { test, expect } from './fixtures/atlas'

test('Atlas loads composite code and vocabulary only after selecting a composite', async ({
  page,
}) => {
  const scripts = new Set<string>()
  let vocabRequests = 0
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.add(request.url())
    if (new URL(request.url()).pathname.endsWith('/vocab.json')) vocabRequests++
  })
  await page.goto('/bae/')
  const result = page.getByRole('link', { name: /Alpha contexts/ })
  await expect(result).toBeVisible()
  const initialScripts = new Set(scripts)
  expect(vocabRequests).toBe(0)

  // A new application script must be needed for the first composite. This
  // rejects eagerly importing its view, without coupling to a hashed filename.
  const compositeScript = page.waitForRequest((request) => {
    const url = new URL(request.url())
    return (
      request.resourceType() === 'script' &&
      url.origin === new URL(page.url()).origin &&
      url.pathname.startsWith('/_astro/') &&
      !initialScripts.has(request.url())
    )
  })
  await result.click()
  await compositeScript
  await expect(page.getByRole('heading', { name: 'Alpha contexts' })).toBeVisible()
  await expect(page.locator('canvas[aria-label*="3D scatter"]')).toBeVisible()
  expect(vocabRequests).toBe(1)
  await page.getByRole('link', { name: /Beta contexts/ }).click()
  await expect(page.getByRole('heading', { name: 'Beta contexts' })).toBeVisible()
  expect(vocabRequests).toBe(1)
})

test('invalid composite IDs do not load a different composite', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (/\/latent_/.test(request.url())) requests.push(request.url())
  })
  await page.goto('/bae/?composite=1627invalid')
  await expect(page.getByText('Unknown composite ID', { exact: false })).toBeVisible()
  expect(requests).toEqual([])
  await expect(page.locator('canvas[aria-label*="3D scatter"]')).toHaveCount(0)
  await page.getByRole('link', { name: 'Atlas overview', exact: true }).click()
  await expect(page.locator('aside').getByRole('link')).toHaveCount(2)
  await expect(page.locator('.alert-error')).toHaveCount(0)
})

test('Atlas search filters live and copied composite links open independently', async ({
  page,
  context,
}) => {
  await page.goto('/bae/')
  const sidebar = page.locator('aside')
  await expect(sidebar.getByRole('link')).toHaveCount(2)
  const search = page.getByRole('searchbox', { name: 'search composite descriptions' })
  await search.fill('Beta')
  await expect(sidebar.getByRole('link')).toHaveCount(1)
  const result = sidebar.getByRole('link', { name: /Beta contexts/ })
  await expect(result).toHaveAttribute('href', '/bae/?composite=01628&q=Beta')

  const href = await result.getAttribute('href')
  expect(href).not.toBeNull()
  const tab = await context.newPage()
  const response = await tab.goto(href!)
  expect(response?.status()).toBe(200)
  await expect(tab.getByRole('heading', { name: 'Beta contexts' })).toBeVisible()
  await tab.close()

  await search.press('Escape')
  await expect(search).toHaveValue('')
  await expect(sidebar.getByRole('link')).toHaveCount(2)
})

test('Atlas search results are visible and navigable on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/bae/')
  const search = page.getByRole('searchbox', { name: 'search composite descriptions' })
  await search.fill('Alpha')
  const result = page.locator('aside').getByRole('link', { name: /Alpha contexts/ })
  await expect(result).toBeInViewport()
  await result.click()
  await expect(page).toHaveURL(/composite=01627&q=Alpha$/)
  await expect(page).toHaveTitle(/Alpha contexts/)
  await expect(page.locator('canvas[aria-label*="3D scatter"]')).toBeVisible()
  const back = page.getByRole('link', { name: 'Back to results', exact: true })
  await expect(back).toBeInViewport()
  await expect(back).toHaveAttribute('href', '/bae/?q=Alpha')
  await back.click()
  await expect(page).toHaveURL(/\/bae\/\?q=Alpha$/)
  await expect(search).toHaveValue('Alpha')
  await expect(result).toBeInViewport()
})

test('Atlas header controls fit without overlap on phones, tablets and desktops', async ({
  page,
}) => {
  for (const path of ['/bae/', '/bae/?composite=1627']) {
    await page.goto(path)
    await expect(
      page.getByRole('searchbox', { name: 'search composite descriptions' }),
    ).toBeVisible()
    if (path.includes('composite')) {
      await expect(page.getByRole('heading', { name: 'Alpha contexts' })).toBeVisible()
    }
    await page.evaluate(() => document.fonts.ready)

    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      const geometry = await page.getByRole('banner').evaluate((header) => {
        const bounds = header.getBoundingClientRect()
        // Inspect visible controls themselves: a shrinking nav can conceal
        // overlapping children without increasing the document's scrollWidth.
        const controls = Array.from(
          header.querySelectorAll<HTMLElement>('nav a, button, label'),
          (node) => ({
            label: node.getAttribute('aria-label') || node.textContent?.trim() || node.tagName,
            box: node.getBoundingClientRect(),
          }),
        ).filter(({ box }) => box.width > 0 && box.height > 0)
        const overlaps: string[] = []
        for (const [index, first] of controls.entries()) {
          for (const second of controls.slice(index + 1)) {
            if (
              Math.min(first.box.right, second.box.right) >
                Math.max(first.box.left, second.box.left) &&
              Math.min(first.box.bottom, second.box.bottom) >
                Math.max(first.box.top, second.box.top)
            ) {
              overlaps.push(`${first.label} overlaps ${second.label}`)
            }
          }
        }
        return {
          count: controls.length,
          overlaps,
          outside: controls
            .filter(
              ({ box }) =>
                box.left < 0 ||
                box.right > innerWidth ||
                box.top < bounds.top ||
                box.bottom > bounds.bottom,
            )
            .map(({ label }) => label),
        }
      })
      expect(geometry.count, `${path} at ${width}px`).toBeGreaterThanOrEqual(3)
      expect(geometry.overlaps, `${path} at ${width}px`).toEqual([])
      expect(geometry.outside, `${path} at ${width}px`).toEqual([])
    }
  }
})

test('typing on a composite stays there until Enter and history restores both views', async ({
  page,
}) => {
  await page.goto('/bae/?composite=1627')
  await expect(page.getByRole('heading', { name: 'Alpha contexts' })).toBeVisible()
  const search = page.getByRole('searchbox', { name: 'search composite descriptions' })
  await search.evaluate((node) => node.setAttribute('data-history-witness', 'same-navbar'))
  const historyState = { navigationWitness: 'preserve-existing-state' }
  await page.evaluate((state) => history.replaceState(state, '', location.href), historyState)

  await search.fill('Beta')
  await expect(page.getByRole('heading', { name: 'Alpha contexts' })).toBeVisible()
  await expect(page).toHaveURL(/composite=1627&q=Beta$/)
  await search.press('Enter')
  await expect(page.locator('aside').getByRole('link', { name: /Beta contexts/ })).toBeVisible()
  await expect(page).toHaveURL(/\/bae\/\?q=Beta$/)
  expect(await page.evaluate(() => history.state)).toEqual(historyState)

  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Alpha contexts' })).toBeVisible()
  await expect(search).toHaveValue('Beta')
  await expect(search).toHaveAttribute('data-history-witness', 'same-navbar')
  await page.goForward()
  await expect(page.locator('aside').getByRole('link')).toHaveCount(1)
  await expect(search).toHaveAttribute('data-history-witness', 'same-navbar')
})

test('Atlas state follows navigation away, back, and a fresh entry', async ({ page }) => {
  await page.goto('/bae/?composite=1627&q=Alpha')
  await expect(page.getByRole('heading', { name: 'Alpha contexts' })).toBeVisible()
  await page.getByRole('link', { name: 'Home', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Thomas Dooms' })).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Alpha contexts' })).toBeVisible()
  await page.goForward()
  await expect(page.getByRole('heading', { name: 'Thomas Dooms' })).toBeVisible()
  await page.locator('a[href="/bae"]').first().click()
  await expect(page.getByRole('searchbox', { name: 'search composite descriptions' })).toHaveValue(
    '',
  )
  await expect(page.locator('aside').getByRole('link')).toHaveCount(2)
  await expect(page.locator('canvas[aria-label*="3D scatter"]')).toHaveCount(0)
})

test('saved dark theme initializes the Atlas toggle on direct entry and navigation', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('theme', 'dark'))
  await page.goto('/bae/')
  await expect(page.locator('input.theme-controller')).toBeChecked()
  await page.locator('label[aria-label="Toggle dark mode"]').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  await page.getByRole('link', { name: 'Home', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Thomas Dooms' })).toBeVisible()
  await expect(page.locator('input.theme-controller')).not.toBeChecked()
  await page.locator('label[aria-label="Toggle dark mode"]').click()
  await page.locator('a[href="/bae"]').first().click()
  await expect(page.locator('input.theme-controller')).toBeChecked()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})
