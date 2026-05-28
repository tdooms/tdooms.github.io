import { test, expect } from '@playwright/test'

test.describe('responsive layout', () => {
  test('home renders the hero at both desktop and mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await expect(page.locator('h1', { hasText: 'Thomas Dooms' })).toBeVisible()

    await page.setViewportSize({ width: 375, height: 812 })
    await expect(page.locator('h1', { hasText: 'Thomas Dooms' })).toBeVisible()
  })

  test('research cards render at both desktop and mobile viewports', async ({ page }) => {
    await page.goto('/research')
    const card = page.locator('h5', { hasText: /./ }).first()

    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(card).toBeVisible()

    await page.setViewportSize({ width: 375, height: 812 })
    await expect(card).toBeVisible()
  })

  test('subpages render the back link', async ({ page }) => {
    await page.goto('/research/bilinear')
    const back = page.locator('a[href="/"]', { hasText: 'Thomas Dooms' })
    await expect(back).toBeVisible()
  })
})
