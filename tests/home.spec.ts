import { test, expect } from '@playwright/test'

test.describe('homepage', () => {
  test('profile card renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1', { hasText: 'Thomas Dooms' })).toBeVisible()
    await expect(page.locator('text=PhD Researcher')).toBeVisible()
  })

  test('social links have correct targets', async ({ page }) => {
    await page.goto('/')
    const github = page.locator('a[href*="github.com/tdooms"]')
    await expect(github).toBeVisible()
  })

  test('news items are visible', async ({ page }) => {
    await page.goto('/')
    const newsItems = page.locator('.news-item')
    const count = await newsItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('load-more reveals additional news and disappears when done', async ({ page }) => {
    await page.goto('/')

    const loadMore = page.locator('#load-more-btn')
    if (!(await loadMore.isVisible())) return

    const totalItems = await page.locator('.news-item').count()
    let visibleBefore = await page.locator('.news-item:not(.hidden)').count()

    while (await loadMore.isVisible()) {
      await loadMore.click()
      const visibleAfter = await page.locator('.news-item:not(.hidden)').count()
      expect(visibleAfter).toBeGreaterThan(visibleBefore)
      visibleBefore = visibleAfter
    }

    expect(visibleBefore).toBe(totalItems)
    await expect(loadMore).not.toBeVisible()
  })
})
