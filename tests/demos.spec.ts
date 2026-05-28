import { test, expect } from '@playwright/test'

test.describe('eigenvectors demo', () => {
  test('renders with menu and image', async ({ page }) => {
    await page.goto('/demos/eigenvectors')

    await expect(page.locator('.menu')).toBeVisible()
    const img = page.locator('img[alt^="Eigenvector"]')
    await expect(img).toBeVisible()
  })

  test('category buttons change the displayed image', async ({ page }) => {
    await page.goto('/demos/eigenvectors')

    const img = page.locator('img[alt^="Eigenvector"]')
    const srcBefore = await img.getAttribute('src')

    await page.locator('.menu button', { hasText: 'Light' }).first().click()
    const srcAfter = await img.getAttribute('src')
    expect(srcAfter).not.toBe(srcBefore)
  })

  test('tab selection updates image and URL', async ({ page }) => {
    await page.goto('/demos/eigenvectors')

    // Scope to the first .tabs container (positive eigenvector indices).
    // Wait for the Svelte island to hydrate before clicking — without this,
    // clicks can land before the onclick handler is bound.
    const positiveTabs = page.locator('.tabs.tabs-box').first()
    const tab = positiveTabs.locator('button.tab', { hasText: '3' })
    await expect(tab).toBeVisible()
    await tab.click()

    await page.waitForURL(/index=3/)
    await expect(tab).toHaveClass(/tab-active/)
  })

  test('URL params restore state on load', async ({ page }) => {
    await page.goto('/demos/eigenvectors?model=rotate-medium&index=2')

    const img = page.locator('img[alt^="Eigenvector"]')
    await expect(img).toHaveAttribute('src', /rotate-medium/)

    const positiveTabs = page.locator('.tabs.tabs-box').first()
    const tab = positiveTabs.locator('button.tab.tab-active', { hasText: '2' })
    await expect(tab).toBeVisible()
  })
})

test.describe('manifolds demo', () => {
  test('3D scene renders a canvas', async ({ page }) => {
    await page.goto('/demos/manifolds')

    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible({ timeout: 10_000 })
  })

  test('sample tabs switch without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/demos/manifolds')
    await page.locator('canvas').waitFor({ timeout: 10_000 })

    const tabs = page.locator('button.tab')
    const count = await tabs.count()

    for (let i = 0; i < count; i++) {
      await tabs.nth(i).click()
      await page.waitForTimeout(500)
    }

    expect(errors).toHaveLength(0)
  })
})
