import { test, expect } from '@playwright/test'

test.describe('responsive layout', () => {
  test('home renders the hero at both desktop and mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await expect(page.locator('h1', { hasText: 'Thomas Dooms' })).toBeVisible()

    await page.setViewportSize({ width: 375, height: 812 })
    await expect(page.locator('h1', { hasText: 'Thomas Dooms' })).toBeVisible()
  })

  test('home paper grid renders at both desktop and mobile viewports', async ({ page }) => {
    await page.goto('/')
    const card = page.locator('a[href^="/research/"]').first()

    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(card).toBeVisible()

    await page.setViewportSize({ width: 375, height: 812 })
    await expect(card).toBeVisible()
  })

  test('subpages render the home icon in the top-left', async ({ page }) => {
    await page.goto('/research/bilinear')
    const home = page.locator('a[aria-label="Home"]')
    await expect(home).toBeVisible()
  })
})
