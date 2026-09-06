import type { ElementHandle, Page } from '@playwright/test'
import { test, expect } from './fixtures/atlas'

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    // Keep the rendered WebGL pixels readable for this test. Production can
    // discard its drawing buffer after compositing, making toDataURL blank.
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
})

async function canvasPixels(canvas: ElementHandle): Promise<string> {
  return canvas.evaluate(async (node) => {
    if (!(node instanceof HTMLCanvasElement) || !node.isConnected) {
      throw new Error('The original canvas must remain mounted while changing theme')
    }
    const copy = document.createElement('canvas')
    copy.width = node.width
    copy.height = node.height
    const context = copy.getContext('2d')!
    context.drawImage(node, 0, 0)
    const pixels = context.getImageData(0, 0, copy.width, copy.height).data
    if (!pixels.some((value, index) => index % 4 === 3 && value !== 0)) {
      throw new Error('The canvas has no rendered marks')
    }
    // Hash only canvas pixels, excluding the CSS page background. Otherwise
    // the page changing colour could hide an unchanged chart or 3D scene.
    const hash = await crypto.subtle.digest('SHA-256', pixels)
    return Array.from(new Uint8Array(hash), (value) => value.toString(16).padStart(2, '0')).join('')
  })
}

async function expectThemeRepaint(page: Page, count: number) {
  await expect(page.locator('canvas')).toHaveCount(count)
  await page.waitForLoadState('networkidle')
  const canvases = await page.locator('canvas').elementHandles()
  const read = () => Promise.all(canvases.map(canvasPixels))
  let light: string[] = []
  // ECharts animates its first render. Establish a settled light image before
  // asking a theme change to repaint the same existing canvas instances.
  await expect
    .poll(
      async () => {
        const current = await read()
        const stable = current.every((value, i) => value === light[i])
        light = current
        return stable
      },
      { intervals: [100, 200, 400] },
    )
    .toBe(true)

  const toggle = page.locator('label[aria-label="Toggle dark mode"]')
  await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect.poll(async () => (await read()).every((value, i) => value !== light[i])).toBe(true)

  await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  // Restoration rejects differences caused only by ongoing animation.
  await expect.poll(read).toEqual(light)
}

test('Atlas overview recolours its chart while preserving a narrowed rank range', async ({
  page,
}) => {
  await page.addInitScript(() => {
    // ECharts draws its draggable rank labels into canvas. Record their real
    // glyph centres so the interaction does not rely on guessed coordinates.
    const fillText = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (
      this: CanvasRenderingContext2D,
      ...args: Parameters<typeof fillText>
    ) {
      const [text, x, y] = args
      if (this.canvas instanceof HTMLCanvasElement && (text === '2' || text === '5')) {
        const metrics = this.measureText(text)
        const point = new DOMPoint(
          x + (metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft) / 2,
          y + (metrics.actualBoundingBoxDescent - metrics.actualBoundingBoxAscent) / 2,
        ).matrixTransform(this.getTransform())
        this.canvas.setAttribute(
          `data-rank-${text === '2' ? 'minimum' : 'maximum'}`,
          JSON.stringify({ x: point.x, y: point.y }),
        )
      }
      return Reflect.apply(fillText, this, args)
    }
  })
  await page.goto('/bae/')
  const canvas = page.locator('canvas')
  await expect(canvas).toHaveAttribute('data-rank-minimum', /\S/)
  await expect(canvas).toHaveAttribute('data-rank-maximum', /\S/)
  await page.waitForLoadState('networkidle')
  const fullRange = await canvasPixels((await canvas.elementHandle())!)
  const { minimum, maximum } = await canvas.evaluate((node) => {
    if (!(node instanceof HTMLCanvasElement)) throw new Error('Overview canvas missing')
    const rect = node.getBoundingClientRect()
    const pointOf = (name: string) => {
      const point = JSON.parse(node.getAttribute(`data-rank-${name}`)!)
      return {
        x: rect.x + (point.x * rect.width) / node.width,
        y: rect.y + (point.y * rect.height) / node.height,
      }
    }
    return { minimum: pointOf('minimum'), maximum: pointOf('maximum') }
  })
  // The fixture's ranks are 2 and 3, on the displayed extent [2, 5]. Raising
  // the lower handle one quarter of the bar excludes rank 2 and retains 3.
  await page.mouse.move(minimum.x, minimum.y)
  await page.mouse.down()
  await page.mouse.move(minimum.x + (maximum.x - minimum.x) / 4, minimum.y, { steps: 5 })
  await page.mouse.up()
  await page.mouse.move(0, 0)
  await expect.poll(async () => canvasPixels((await canvas.elementHandle())!)).not.toBe(fullRange)
  // This roundtrip must restore the selected image, not the full-range one.
  await expectThemeRepaint(page, 1)
})

test('Atlas composite recolours the manifold and both charts when the theme changes', async ({
  page,
}) => {
  await page.goto('/bae/?composite=1627')
  await expectThemeRepaint(page, 3)
})

test('manifold dot colours match CSS linear-light mixing in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/bae/?composite=1627')
  const canvas = page.locator('canvas[aria-label*="3D scatter"]')
  await expect(canvas).toBeVisible()

  for (const mode of ['light', 'dark']) {
    if (mode === 'dark') await page.locator('label[aria-label="Toggle dark mode"]').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', mode)
    await expect
      .poll(
        async () =>
          canvas.evaluate((node) => {
            if (!(node instanceof HTMLCanvasElement)) throw new Error('Manifold canvas missing')
            const copy = document.createElement('canvas')
            copy.width = node.width
            copy.height = node.height
            const context = copy.getContext('2d')!
            context.drawImage(node, 0, 0)
            const pixels = context.getImageData(0, 0, copy.width, copy.height).data
            const colours = new Set<number>()
            for (let i = 0; i < pixels.length; i += 4) {
              // Opaque dot interiors exclude multisample antialiasing at their edges.
              if (pixels[i + 3] === 255)
                colours.add((pixels[i]! << 16) | (pixels[i + 1]! << 8) | pixels[i + 2]!)
            }

            const css = getComputedStyle(document.documentElement)
            const rgb8 = (colour: string) => {
              if (!CSS.supports('color', colour)) throw new Error(`Unsupported colour: ${colour}`)
              context.fillStyle = colour
              context.fillRect(0, 0, 1, 1)
              const pixel = context.getImageData(0, 0, 1, 1).data
              return `rgb(${pixel[0]} ${pixel[1]} ${pixel[2]})`
            }
            // The renderer accepts resolved RGB8 theme inputs. Resolve each
            // CSS colour before mixing: the light teal lies outside sRGB,
            // so mixing its raw OKLCH value would test a different gamut path.
            const neutral = rgb8(css.getPropertyValue('--color-base-300'))
            return Math.max(
              ...['primary', 'secondary'].map((accent) => {
                // The real Arrow fixture includes both h=+127 and h=-127: full
                // activation uses 80% of the respective accent and 20% neutral.
                const mix = `color-mix(in srgb-linear, ${rgb8(css.getPropertyValue(`--color-${accent}`))} 80%, ${neutral})`
                if (!CSS.supports('color', mix)) throw new Error(`Unsupported swatch: ${mix}`)
                context.fillStyle = mix
                context.fillRect(0, 0, 1, 1)
                const expected = context.getImageData(0, 0, 1, 1).data
                let nearest = Infinity
                for (const colour of colours) {
                  nearest = Math.min(
                    nearest,
                    Math.max(
                      Math.abs((colour >> 16) - expected[0]!),
                      Math.abs(((colour >> 8) & 255) - expected[1]!),
                      Math.abs((colour & 255) - expected[2]!),
                    ),
                  )
                }
                return nearest
              }),
            )
          }),
        { message: `${mode} dots must match the browser's CSS colour swatches` },
      )
      // Theme inputs and framebuffer outputs round to 8-bit channels. One
      // unit allows that rounding without accepting a missing colour transform.
      .toBeLessThanOrEqual(1)
  }
})
