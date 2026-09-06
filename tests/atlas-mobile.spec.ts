import type { Page } from '@playwright/test'
import { test, expect } from './fixtures/atlas'

test.use({ viewport: { width: 375, height: 812 }, hasTouch: true })

// Observe rendered output over successive browser frames, without reading
// application state or chart-library options. Start before opening a panel
// when the first painted frame is part of the contract.
function canvasFrames(page: Page, selector: string) {
  return page.evaluate(async (selector) => {
    const find = () => Array.from(document.querySelectorAll<HTMLCanvasElement>(selector))
    if (!find().length) {
      await new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => {
          if (find().length) {
            observer.disconnect()
            resolve()
          }
        })
        observer.observe(document.body, { childList: true, subtree: true })
      })
    }
    const samples = find().map((canvas) => ({ canvas, images: new Set<string>(), painted: true }))
    for (let frame = 0; frame < 12; frame++) {
      await new Promise(requestAnimationFrame)
      for (const sample of samples) {
        const { canvas } = sample
        if (!canvas.width || !canvas.height) throw new Error(`Empty canvas in ${selector}`)
        const copy = document.createElement('canvas')
        copy.width = canvas.width
        copy.height = canvas.height
        const context = copy.getContext('2d')!
        context.drawImage(canvas, 0, 0)
        const pixels = context.getImageData(0, 0, copy.width, copy.height).data
        sample.painted &&= pixels.some((value, channel) => channel % 4 === 3 && value !== 0)
        sample.images.add(copy.toDataURL())
      }
    }
    return samples.map(({ images, painted }) => ({ versions: images.size, painted }))
  }, selector)
}

test('phone overview exposes curated results by touch and switches to search results', async ({
  page,
}) => {
  await page.goto('/bae/')
  const plot = page.getByRole('button', { name: 'Plot', exact: true })
  const results = page.getByRole('button', { name: 'Results', exact: true })
  await expect(plot).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('region', { name: 'Overview plot' }).locator('canvas')).toBeVisible()

  await results.tap()
  await expect(results).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('link', { name: /Alpha contexts/ })).toBeInViewport()
  await expect(page.getByRole('link', { name: /Beta contexts/ })).toBeInViewport()

  await plot.focus()
  await plot.press('Enter')
  await expect(plot).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('link', { name: /Alpha contexts/ })).not.toBeVisible()
  await page.getByRole('searchbox', { name: 'search composite descriptions' }).fill('Beta')
  await expect(results).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('link', { name: /Beta contexts/ })).toBeInViewport()
  await expect(page.getByRole('link', { name: /Alpha contexts/ })).not.toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)

  await page.setViewportSize({ width: 1024, height: 900 })
  await expect(page.getByRole('region', { name: 'Overview plot' }).locator('canvas')).toBeVisible()
  await expect(page.getByRole('link', { name: /Beta contexts/ })).toBeVisible()
  await expect(plot).not.toBeVisible()
})

test('phone composite details and neighbours remain accessible by keyboard and touch', async ({
  page,
}) => {
  await page.goto('/bae/?composite=1627')
  const detailsButton = page.getByRole('button', { name: 'Details', exact: true })
  await detailsButton.focus()
  await detailsButton.press('Space')
  await expect(detailsButton).toHaveAttribute('aria-pressed', 'true')
  const details = page.getByRole('complementary', { name: 'Composite details' })
  await expect(details.getByRole('heading', { name: 'Alpha contexts' })).toBeVisible()
  for (const label of ['density', 'rank', 'support', 'importance', 'captured']) {
    await expect(details.getByRole('button', { name: new RegExp(`^${label}\\b`) })).toBeVisible()
  }
  for (const name of [/firing distribution/i, /eigenvalue spectrum/i, /top activations/i]) {
    const heading = details.getByRole('heading', { name })
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeInViewport()
  }
  await expect(details).toContainText('alpha')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)

  await page.getByRole('button', { name: 'Related', exact: true }).tap()
  const neighbours = page.getByRole('complementary', { name: 'Closest neighbours' })
  const beta = neighbours.getByRole('link', { name: /Beta contexts/ })
  await expect(beta).toBeInViewport()
  await beta.tap()
  await expect(page).toHaveURL(/composite=01628$/)
  await expect(page).toHaveTitle(/Beta contexts/)

  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(details.getByRole('heading', { name: 'Beta contexts' })).toBeVisible()
  await expect(neighbours.getByRole('link', { name: /Alpha contexts/ })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Composite plot' }).locator('canvas')).toBeVisible()
  await expect(detailsButton).not.toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440)
})

test('phone statistic popovers escape the scrolling panel and support native dismissal', async ({
  page,
}) => {
  await page.goto('/bae/?composite=1627')
  await page.getByRole('button', { name: 'Details', exact: true }).tap()
  const details = page.getByRole('complementary', { name: 'Composite details' })
  const density = details.getByRole('button', { name: /^density\b/ })
  await density.tap()
  const popup = page.locator('[popover]:popover-open')
  await expect(popup).toContainText('Hoyer density')
  await details.evaluate((panel) => {
    panel.scrollTop = panel.scrollHeight
  })
  await expect(popup).toBeVisible()
  await expect
    .poll(() =>
      popup.evaluate((element) => {
        const box = element.getBoundingClientRect()
        const middleX = (box.left + box.right) / 2
        const middleY = (box.top + box.bottom) / 2
        return {
          fits:
            box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight,
          // Hit testing catches clipping by the scrolling ancestor, even when
          // the popup's nominal bounding rectangle lies inside the viewport.
          unclipped: [
            [middleX, box.top + 4],
            [middleX, box.bottom - 4],
            [box.left + 4, middleY],
            [box.right - 4, middleY],
          ].every(([x, y]) => element.contains(document.elementFromPoint(x!, y!))),
        }
      }),
    )
    .toEqual({ fits: true, unclipped: true })

  await page.keyboard.press('Escape')
  await expect(popup).toHaveCount(0)
  await density.scrollIntoViewIfNeeded()
  await density.focus()
  await density.press('Enter')
  await expect(popup).toBeVisible()
  await page.touchscreen.tap(373, 810)
  await expect(popup).toHaveCount(0)
})

test('a hidden plot pauses while preserving the chosen rotation setting', async ({ page }) => {
  await page.addInitScript(() => {
    // Browsers may discard WebGL pixels after compositing. Preserve them so
    // the witness observes scene changes rather than an empty drawing buffer.
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
  const canvas = page.locator('#composite-plot canvas')
  await expect(canvas).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const rotate = page.getByRole('button', { name: 'toggle auto-rotate', exact: true })
  await rotate.tap()
  await expect(rotate).toHaveAttribute('aria-pressed', 'true')
  const moving = await canvasFrames(page, '#composite-plot canvas')
  expect(moving[0]?.painted).toBe(true)
  expect(moving[0]?.versions).toBeGreaterThan(1)

  await page.getByRole('button', { name: 'Details', exact: true }).tap()
  await expect(canvas).not.toBeVisible()
  await page.keyboard.down('w')
  try {
    expect(await canvasFrames(page, '#composite-plot canvas')).toEqual([
      { versions: 1, painted: true },
    ])
  } finally {
    await page.keyboard.up('w')
  }
  await page.getByRole('button', { name: 'Plot', exact: true }).tap()
  await expect(rotate).toHaveAttribute('aria-pressed', 'true')
  const resumed = await canvasFrames(page, '#composite-plot canvas')
  expect(resumed[0]?.painted).toBe(true)
  expect(resumed[0]?.versions).toBeGreaterThan(1)
})

test('reduced motion renders charts without an animated entrance and leaves rotation opt-in', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/bae/?q=Alpha')
  await expect(page.getByRole('button', { name: 'Results', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.evaluate(() => document.fonts.ready)
  const overview = canvasFrames(page, '#overview-plot canvas')
  await page.getByRole('button', { name: 'Plot', exact: true }).tap()
  expect(await overview).toEqual([{ versions: 1, painted: true }])

  // Changing the preference must affect an already mounted chart as well.
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const canvas = page.locator('#overview-plot canvas')
  const light = await canvas.evaluate((node) => (node as HTMLCanvasElement).toDataURL())
  await page.locator('label[aria-label="Toggle dark mode"]').tap()
  expect(await canvasFrames(page, '#overview-plot canvas')).toEqual([
    { versions: 1, painted: true },
  ])
  expect(await canvas.evaluate((node) => (node as HTMLCanvasElement).toDataURL())).not.toBe(light)

  await page.goto('/bae/?composite=1627&rotate=1')
  const rotate = page.getByRole('button', { name: 'toggle auto-rotate', exact: true })
  await expect(rotate).toHaveAttribute('aria-pressed', 'false')
  await page.evaluate(() => document.fonts.ready)
  const details = canvasFrames(page, '#composite-details canvas')
  await page.getByRole('button', { name: 'Details', exact: true }).tap()
  expect(await details).toEqual([
    { versions: 1, painted: true },
    { versions: 1, painted: true },
  ])
  await page.getByRole('button', { name: 'Plot', exact: true }).tap()
  await rotate.tap()
  await expect(rotate).toHaveAttribute('aria-pressed', 'true')
})
