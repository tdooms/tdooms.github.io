import { test, expect } from './fixtures/atlas'

test('Atlas skips its header, announces search counts and restores the reading position', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/bae/')
  await expect(page.getByRole('img', { name: /^UMAP overview of 2 composites/ })).toBeVisible()
  const heading = page.getByRole('heading', { level: 1, name: 'Atlas', exact: true })
  await expect(heading).not.toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Plot', exact: true })).toBeFocused()

  // A plain slash must not hijack character navigation. The modified shortcut remains.
  await page.keyboard.press('/')
  await expect(page.getByRole('button', { name: 'Plot', exact: true })).toBeFocused()
  await page.keyboard.press('Control+k')
  const search = page.getByRole('searchbox')
  await expect(search).toBeFocused()
  await search.fill('no matching description')
  await expect(page.getByRole('status')).toHaveText('0 matches')
  await expect(search).toBeFocused()
  await search.fill('Beta')
  await expect(page.getByRole('status')).toHaveText('1 match')
  await expect(search).toBeFocused()

  const result = page.getByRole('link', { name: /Beta contexts/ })
  await result.focus()
  await result.press('Enter')
  await expect(heading).toBeFocused()
  await expect(heading).toHaveAccessibleDescription('Composite 1628: Beta contexts')
  await page.goBack()
  await expect(heading).toBeFocused()
  await expect(heading).toHaveAccessibleDescription('Overview')
  await expect(page.getByRole('link', { name: /Beta contexts/ })).toBeVisible()
})

test('a completed composite request does not take focus from someone typing', async ({ page }) => {
  let release!: () => void
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/latent_01627.json', async (route) => {
    await held
    await route.fallback()
  })
  try {
    await page.goto('/bae/?q=Alpha')
    const requested = page.waitForRequest('**/latent_01627.json')
    await page.getByRole('link', { name: /Alpha contexts/ }).click()
    await requested
    const search = page.getByRole('searchbox')
    await search.fill('Beta')
    release()
    await expect(
      page.getByRole('application', { name: /^3D scatter of 4 sampled token contexts/ }),
    ).toBeVisible()
    await expect(search).toBeFocused()
    await expect(search).toHaveValue('Beta')
  } finally {
    release()
  }
})

test('phone charts describe their data and expose their plotted values by keyboard', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/bae/?composite=1627')
  const plot = page.getByRole('application', { name: /^3D scatter of 4 sampled token contexts/ })
  await expect(plot).toBeVisible()
  await expect(plot).toHaveAccessibleDescription(/While the plot has focus/)
  await page.getByRole('button', { name: 'Details', exact: true }).click()
  await expect(
    page.getByRole('img', { name: /^Firing distribution with 2 bins from -1 to 1/ }),
  ).toBeVisible()
  const histogram = page.locator('details').filter({ hasText: 'for firing distribution' })
  await expect(histogram.locator('table')).toHaveCount(0)
  await histogram.locator('summary').focus()
  await histogram.locator('summary').press('Enter')
  await expect(histogram.getByRole('table')).toHaveAccessibleName(/Firing distribution values/)
  await expect(histogram.getByRole('cell')).toHaveText(['-1', '0', '1', '0', '1', '2'])

  const spectrum = page.locator('details').filter({ hasText: 'for eigenvalue spectrum' })
  await spectrum.locator('summary').focus()
  await spectrum.locator('summary').press('Space')
  await expect(spectrum.getByRole('table')).toHaveAccessibleName(
    /relative to the largest absolute eigenvalue/,
  )
  await expect(spectrum.getByRole('cell')).toHaveText([
    '1',
    '-0.5',
    'Y',
    '2',
    '0.25',
    'Z',
    '3',
    '1',
    'X',
  ])
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)
  await spectrum.locator('summary').press('Space')
  await expect(spectrum.locator('table')).toHaveCount(0)
})

test('camera keys work only while the plot has focus and stop when focus leaves', async ({
  page,
}) => {
  await page.addInitScript(() => {
    // Inspect only the rendered scene. Element screenshots include the
    // neighbouring controls and their focus rings within the canvas bounds.
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      attributes?: object,
    ) {
      return Reflect.apply(getContext, this, [
        type,
        type.startsWith('webgl') ? { ...attributes, preserveDrawingBuffer: true } : attributes,
      ])
    } as typeof getContext
  })
  await page.goto('/bae/?composite=1627')
  const plot = page.getByRole('application', { name: /^3D scatter of 4 sampled token contexts/ })
  await expect(plot).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await page.mouse.move(0, 0)
  await plot.focus()
  const pixels = () =>
    plot.evaluate(async (node) => {
      await new Promise(requestAnimationFrame)
      return (node as HTMLCanvasElement).toDataURL()
    })
  await pixels()
  const initial = await pixels()
  await page.keyboard.down('w')
  try {
    await expect.poll(async () => (await pixels()) !== initial).toBe(true)
    // Move focus while the key is still held: blur must clear the held-key state.
    await page.getByRole('button', { name: 'toggle auto-rotate', exact: true }).focus()
    const paused = await pixels()
    await page.waitForTimeout(150)
    expect((await pixels()) === paused).toBe(true)
  } finally {
    await page.keyboard.up('w')
  }
  const unchanged = await pixels()
  await page.keyboard.down('a')
  try {
    await page.waitForTimeout(150)
    expect((await pixels()) === unchanged).toBe(true)
  } finally {
    await page.keyboard.up('a')
  }
})
