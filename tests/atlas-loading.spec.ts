import { tableFromArrays, tableToIPC } from 'apache-arrow'
import { test, expect } from './fixtures/atlas'

test('Atlas starts each index request before hydration and shows a loading fallback', async ({
  page,
}) => {
  let release!: () => void
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/Explorer.*.js', async (route) => {
    await held
    await route.continue()
  })
  const requests: string[] = []
  page.on('request', (request) => {
    const file = new URL(request.url()).pathname.split('/').at(-1)!
    if (['index.feather', 'curated.json', 'clusters.json'].includes(file)) requests.push(file)
  })
  try {
    await page.goto('/bae/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('status')).toHaveText('Loading the atlas…')
    await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible()
    await expect
      .poll(() => [...requests].sort())
      .toEqual(['clusters.json', 'curated.json', 'index.feather'])
  } finally {
    release()
  }
  await expect(page.getByRole('link', { name: /Alpha contexts/ })).toBeVisible()
  expect(requests).toHaveLength(3)
})

test('equations load only for composites and remain readable while formatting loads', async ({
  page,
}) => {
  let release!: () => void
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  const requests: string[] = []
  await page.route(/\/katex[^/]*\.js$/, async (route) => {
    requests.push(route.request().url())
    await held
    await route.continue()
  })
  await page.goto('/bae/')
  await expect(page.getByRole('link', { name: /Alpha contexts/ })).toBeVisible()
  expect(requests).toEqual([])
  await page.getByRole('link', { name: /Alpha contexts/ }).click()
  // A short viewport makes the delayed equation growth require repositioning.
  await page.setViewportSize({ width: 390, height: 320 })
  await page.getByRole('button', { name: 'Details', exact: true }).click()
  const details = page.getByRole('complementary', { name: 'Composite details' })
  await details.getByRole('button', { name: /^density/ }).click()
  const popup = page.locator('[popover]:popover-open')
  try {
    await expect(popup.locator('span.break-all')).toContainText('\\frac')
    await expect.poll(() => requests.length).toBe(1)
    await expect(popup.locator('math')).toHaveCount(0)
  } finally {
    release()
  }
  await expect(popup.locator('math')).toBeAttached()
  await expect(popup.locator('span.break-all')).toHaveCount(0)
  await expect
    .poll(async () => {
      const box = await popup.boundingBox()
      return (
        box !== null &&
        box.x >= 8 &&
        box.y >= 8 &&
        box.x + box.width <= 382 &&
        box.y + box.height <= 312
      )
    })
    .toBe(true)
})

test('an incomplete index fails instead of inventing zero-valued statistics', async ({ page }) => {
  await page.route('**/index.feather', (route) =>
    route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      contentType: 'application/octet-stream',
      body: Buffer.from(tableToIPC(tableFromArrays({ latent_id: new Uint32Array([1627]) }))),
    }),
  )
  await page.goto('/bae/')
  await expect(page.locator('.alert-error')).toContainText('Invalid index column: density')
  await expect(page.locator('main canvas')).toHaveCount(0)
})

test('a failed cluster service is surfaced rather than treated as absent annotations', async ({
  page,
}) => {
  await page.route('**/*.cluster.json', (route) =>
    route.fulfill({
      status: 500,
      headers: { 'access-control-allow-origin': '*' },
      body: 'Service unavailable',
    }),
  )
  await page.goto('/bae/?composite=1627')
  await expect(page.locator('.alert-error')).toContainText('500')
  await expect(page.locator('canvas[aria-label*="3D scatter"]')).toHaveCount(0)
})

test('an incomplete vocabulary fails at loading and leaves the overview reachable', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/vocab.json', (route) =>
    route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      json: { 1: 'alpha', 2: ' beta' },
    }),
  )
  await page.goto('/bae/?composite=1627')
  await expect(page.getByRole('alert')).toContainText('Missing vocabulary token 3')
  await expect(page.locator('canvas[aria-label*="3D scatter"]')).toHaveCount(0)
  await page.getByRole('link', { name: 'Atlas overview', exact: true }).click()
  await expect(page.getByRole('link', { name: /Alpha contexts/ })).toBeVisible()
  expect(errors).toEqual([])
})

test('changing the selected view cancels its unfinished data request', async ({ page }) => {
  let release!: () => void
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/latent_01627.json', async (route) => {
    await held
    await route.fulfill({ headers: { 'access-control-allow-origin': '*' }, status: 500 })
  })
  const requested = page.waitForRequest('**/latent_01627.json')
  await page.goto('/bae/?composite=1627')
  await requested
  const cancelled = page.waitForEvent('requestfailed', (request) =>
    request.url().endsWith('/latent_01627.json'),
  )
  const search = page.getByRole('searchbox', { name: 'search composite descriptions' })
  await search.fill('Beta')
  await search.press('Enter')
  await cancelled
  release()
  await page.getByRole('link', { name: /Beta contexts/ }).click()
  await expect(page.getByRole('heading', { name: 'Beta contexts' })).toBeVisible()
  await expect(page.locator('.alert-error')).toHaveCount(0)
})
