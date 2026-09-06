import { test, expect } from './fixtures/atlas'

test('explanation cards open on hover, stay readable and preserve native activation', async ({
  page,
}) => {
  await page.goto('/bae/')
  const trigger = page.getByRole('button', { name: 'Qwen 3.5 0.8B', exact: true })
  const popup = page.locator('[popover]:popover-open')
  await trigger.hover()
  await expect(popup).toContainText('d_model')

  await popup.hover()
  // Wait beyond the close delay to catch a timer left running across the gap.
  await page.waitForTimeout(250)
  await expect(popup).toBeVisible()
  await page.mouse.move(0, 300)
  await expect(popup).toHaveCount(0)

  await trigger.hover()
  await expect(popup).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(popup).toHaveCount(0)

  await page.mouse.move(0, 300)
  await trigger.hover()
  await trigger.click()
  await page.mouse.move(0, 300)
  await page.waitForTimeout(250)
  await expect(popup).toBeVisible()
  await trigger.click()
  await expect(popup).toHaveCount(0)

  await page.mouse.move(0, 300)
  await trigger.focus()
  await trigger.press('Enter')
  await expect(popup).toBeVisible()
  await page.mouse.click(0, 300)
  await expect(popup).toHaveCount(0)
  await trigger.focus()
  await trigger.press('Space')
  await expect(popup).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(popup).toHaveCount(0)
})

test('3D hover resumes after switching panels', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 })
  await page.goto('/bae/?composite=1627')
  const plot = page.getByRole('region', { name: 'Composite plot' })
  const canvas = plot.locator('canvas')
  const tooltip = plot.getByRole('status')
  // The fixture's origin and the initial camera target are both [0, 0, 0].
  await canvas.hover()
  await expect(tooltip).toHaveText('origin')
  await page.mouse.move(0, 0)
  await expect(tooltip).toHaveCount(0)

  await page.getByRole('button', { name: 'Details', exact: true }).click()
  await page.getByRole('button', { name: 'Plot', exact: true }).click()
  await canvas.hover()
  await expect(tooltip).toHaveText('origin')
  await page.mouse.move(0, 0)
  await expect(tooltip).toHaveCount(0)
})
