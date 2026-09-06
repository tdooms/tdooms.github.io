import axe from 'axe-core'
import { test, expect } from './fixtures/atlas'

test('Atlas overview and composite remain accessible in both themes', async ({ page }) => {
  // Short desktop view forces Details to scroll even with the small fixture.
  await page.setViewportSize({ width: 1440, height: 600 })
  for (const path of ['/bae/', '/bae/?composite=1627']) {
    await page.goto(path)
    await expect(page.locator('canvas').first()).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    if (path.includes('composite')) {
      const details = page.getByRole('complementary', { name: 'Composite details' })
      await details.focus()
      await page.keyboard.press('ArrowDown')
      await expect.poll(() => details.evaluate((node) => node.scrollTop)).toBeGreaterThan(0)
    }
    await page.addScriptTag({ content: axe.source })
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value
      }, theme)
      const violations = await page.evaluate(async () => {
        const engine = (window as typeof window & { axe: typeof axe }).axe
        const result = await engine.run({
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] },
        })
        return result.violations.map(({ id, nodes }) => ({
          id,
          nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
        }))
      })
      expect(violations, `${path} in ${theme} theme`).toEqual([])
    }
  }
})
