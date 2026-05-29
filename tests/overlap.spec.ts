import { test, expect } from '@playwright/test'

// "Sussy behaviour" detector — catches visually overlapping interactive
// elements at runtime. This is what would have caught the previous regression
// where the site's fixed top-right theme-toggle sat directly on top of the
// bae explorer's InfoBar search input. astro check / type-check can't see
// painted geometry; only a real browser layout pass can.
//
// Threshold: two interactive elements that aren't in a parent/child
// relationship and overlap by >50% of the smaller one's area is a bug.
// The threshold is intentionally generous — a couple of pixels of overlap
// is common between adjacent items and is not what we're hunting.

const PAGES = ['/', '/blog', '/resume', '/research/bilinear', '/research/bae', '/bae']

for (const url of PAGES) {
  test(`no overlapping interactive elements on ${url}`, async ({ page }) => {
    await page.goto(url)
    await page.waitForLoadState('networkidle')

    const overlaps = await page.evaluate(() => {
      const SELECTOR = 'a, button, input, label.swap, [role="button"]'
      const els = Array.from(document.querySelectorAll(SELECTOR)) as HTMLElement[]
      const visible = els
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height > 0)

      const intersectArea = (a: DOMRect, b: DOMRect): number => {
        const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
        const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
        return w * h
      }

      const found: Array<{ a: string; b: string; overlapRatio: number }> = []
      const describe = (e: HTMLElement) => {
        const t = e.tagName.toLowerCase()
        const aria = e.getAttribute('aria-label')
        const text = (e.textContent ?? '').trim().slice(0, 40)
        const id = e.id ? `#${e.id}` : ''
        return `<${t}${id}${aria ? ` aria-label="${aria}"` : ''}${text ? ` text="${text}"` : ''}>`
      }

      for (let i = 0; i < visible.length; i++) {
        for (let j = i + 1; j < visible.length; j++) {
          const A = visible[i]!
          const B = visible[j]!
          if (A.el.contains(B.el) || B.el.contains(A.el)) continue
          const overlap = intersectArea(A.r, B.r)
          if (overlap === 0) continue
          const minArea = Math.min(A.r.width * A.r.height, B.r.width * B.r.height)
          const ratio = overlap / minArea
          if (ratio > 0.5) {
            found.push({ a: describe(A.el), b: describe(B.el), overlapRatio: ratio })
          }
        }
      }
      return found
    })

    expect(
      overlaps,
      `${overlaps.length} interactive-overlap(s) on ${url}:\n${overlaps
        .map((o) => `  ${o.a}  ⨯  ${o.b}  (${Math.round(o.overlapRatio * 100)}%)`)
        .join('\n')}`,
    ).toHaveLength(0)
  })
}
