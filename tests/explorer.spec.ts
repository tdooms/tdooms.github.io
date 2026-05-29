import { test, expect } from '@playwright/test'

// Composite 1627 is a known-live latent on the R2 bucket (no cluster.json, but
// the meta + feather files exist). If R2 ever rotates the bucket, swap the id.
const COMPOSITE = '1627'

test('overview renders with a non-collapsed UMAP scatter region', async ({ page }) => {
  await page.goto('/bae/')
  // The Overview's ECharts container is the lone div inside `<section>` in
  // routes/+page.svelte. Wait for the layout fetch to land (network idle is a
  // reliable proxy: index.json + index.feather + curated.json + vocab.json).
  await page.waitForLoadState('networkidle')

  // The chart container fills its grid cell. If the bleed layout regressed,
  // its parent collapses to 0 and the chart would be invisible.
  const chartCell = page.locator('main section').first()
  await expect(chartCell).toBeVisible()
  const box = await chartCell.boundingBox()
  expect(box, 'chart cell missing from DOM').not.toBeNull()
  expect(box!.height, 'chart cell collapsed vertically').toBeGreaterThan(200)
  expect(box!.width, 'chart cell collapsed horizontally').toBeGreaterThan(200)
})

test('composite page renders a non-collapsed WebGL canvas', async ({ page }) => {
  await page.goto(`/bae/?composite=${COMPOSITE}`)
  await page.waitForLoadState('networkidle')

  // Wait for the Manifold canvas to mount — it appears only after the
  // composite-data fetch completes and CompositeLayout renders.
  const canvas = page.locator('canvas[aria-label*="3D scatter"]')
  await expect(canvas).toBeVisible({ timeout: 15_000 })

  // The original layout bug: canvas mounts but height collapses to 0 because
  // `h-full` resolves against a 0-high grid row. astro check / type-check
  // can't catch it; only a real browser layout pass can.
  const box = await canvas.boundingBox()
  expect(box, 'canvas missing from DOM').not.toBeNull()
  expect(
    box!.height,
    'canvas collapsed vertically (likely a height-chain regression)',
  ).toBeGreaterThan(200)
  expect(box!.width, 'canvas collapsed horizontally').toBeGreaterThan(200)
})

test('sidebar items navigate to composite (click interception works)', async ({ page }) => {
  // The bae verbatim components render `<a href="${base}/composite/N">` and
  // expect SvelteKit to intercept the click. Without that, the browser would
  // do a real navigation to /bae/composite/N which 404s (we use query-param
  // routing). Explorer.svelte has a click-delegation handler that rewrites
  // the navigation via `goto()`. This test guards that handler.
  await page.goto('/bae/')
  await page.waitForLoadState('networkidle')

  const sidebarLink = page.locator('aside a[href*="/composite/"]').first()
  await expect(sidebarLink).toBeVisible({ timeout: 10_000 })
  await sidebarLink.click()

  // Click should rewrite into a query-param URL — no 404, no path-style URL.
  await expect.poll(() => new URL(page.url()).searchParams.get('composite')).not.toBeNull()
  expect(new URL(page.url()).pathname).toMatch(/^\/bae\/?$/)
  // And the composite content should actually render (the canvas appears).
  await expect(page.locator('canvas[aria-label*="3D scatter"]')).toBeVisible({ timeout: 15_000 })
})
