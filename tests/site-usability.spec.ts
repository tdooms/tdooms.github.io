import { test, expect } from '@playwright/test'

test('eigenvector selections survive leaving the page and browser Back', async ({ page }) => {
  await page.goto('/research/bilinear?model=rotate-medium&index=-3')
  const demo = page.getByRole('region', { name: 'Eigenvector browser' })
  await demo.scrollIntoViewIfNeeded()
  const image = demo.getByRole('img')
  await expect(image).toHaveAttribute('src', '/eigenvectors/rotate-medium/neg3.svg')
  const historyState = { selectionWitness: 'preserve-existing-state' }
  await page.evaluate((state) => history.replaceState(state, '', location.href), historyState)

  await demo.getByRole('button', { name: 'Translation: Light', exact: true }).click()
  await demo.getByRole('button', { name: 'Positive eigenvector 2', exact: true }).click()
  await expect(image).toHaveAttribute('src', '/eigenvectors/translate-light/pos2.svg')
  await expect(page).toHaveURL(/model=translate-light&index=2/)
  expect(await page.evaluate(() => history.state)).toEqual(historyState)

  await page.getByRole('link', { name: 'Home', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goBack()
  await demo.scrollIntoViewIfNeeded()
  await expect(image).toHaveAttribute('src', '/eigenvectors/translate-light/pos2.svg')
  await expect(
    demo.getByRole('button', { name: 'Positive eigenvector 2', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')

  await page.goForward()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thomas Dooms')
  await page.locator('a[href="/research/bilinear"]').first().click()
  await demo.scrollIntoViewIfNeeded()
  await expect(image).toHaveAttribute('src', '/eigenvectors/noise-strong/pos1.svg')
})

test('eigenvector browser fits a phone and rejects malformed query values', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/research/bilinear?model=unknown&index=2invalid')
  const demo = page.getByRole('region', { name: 'Eigenvector browser' })
  await demo.scrollIntoViewIfNeeded()
  await expect(page.locator('astro-island').filter({ has: demo })).not.toHaveAttribute('ssr')
  await expect(demo.getByRole('img')).toHaveAttribute('src', '/eigenvectors/noise-strong/pos1.svg')

  const overflow = await demo.evaluate((el) => {
    const bounds = el.getBoundingClientRect()
    return {
      viewport: bounds.right > window.innerWidth || bounds.left < 0,
      content: el.scrollWidth > el.clientWidth,
    }
  })
  expect(overflow).toEqual({ viewport: false, content: false })
  expect(
    await demo.getByRole('img').evaluate((el) => el.getBoundingClientRect().width),
  ).toBeGreaterThan(200)
  await demo.getByRole('button', { name: 'Negative eigenvector 5', exact: true }).click()
  await expect(demo.getByRole('img')).toHaveAttribute('src', '/eigenvectors/noise-strong/neg5.svg')
})

test('news titles remain fully readable on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const news = page.locator('section', {
    has: page.getByRole('heading', { name: 'News.', exact: true }),
  })
  const titles = news.getByRole('heading', { level: 3 })
  expect(await titles.count()).toBeGreaterThan(0)
  const clipped = await titles.evaluateAll((elements) =>
    elements
      .filter((el) => el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)
      .map((el) => el.textContent),
  )
  expect(clipped).toEqual([])
})

test('photo tooltips and oversized article text do not widen a phone page', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)

  const gaming = page.locator('.tooltip').filter({ has: page.getByText('gaming', { exact: true }) })
  await gaming.locator('[tabindex="0"]').focus()
  const photos = gaming.locator('img')
  await expect(photos).toHaveCount(2)
  for (const photo of await photos.all()) {
    const bounds = await photo.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(375)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)

  await page.goto('/blog/bazinga')
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)
  const article = page.getByRole('region', { name: 'Bazinga emdash article' })
  await expect(article).toContainText('While many worry about AI stealing our jobs')
  await expect(article).toContainText(/[\u0300-\u036f]/)
  // Firefox wraps the Unicode text; other engines include its overflowing ink
  // in scrollWidth. A wide figure exercises keyboard scrolling in every engine.
  await article.evaluate((element) => {
    const figure = document.createElement('figure')
    figure.style.width = '1000px'
    figure.textContent = 'Wide research figure'
    element.append(figure)
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)
  await article.focus()
  await expect(article).toHaveCSS('overflow-x', 'auto')
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => article.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
})

test('pages expose their heading hierarchy and language names', async ({ page }) => {
  for (const [url, title] of [
    ['/resume', 'Resume'],
    ['/', 'Thomas Dooms'],
    ['/blog/medicine', 'Interpretability and the human body'],
    ['/blog/questions', 'Reflecting on deep learning questions'],
  ] as const) {
    await page.goto(url)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
    const levels = await page
      .locator('main :is(h1, h2, h3, h4, h5, h6)')
      .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))))
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i], `Heading hierarchy on ${url}: ${levels.join(', ')}`).toBeLessThanOrEqual(
        levels[i - 1]! + 1,
      )
    }
    if (url === '/resume') {
      const languages = page.getByRole('progressbar')
      expect(await languages.count()).toBeGreaterThan(0)
      for (const language of await languages.all()) {
        await expect(language).toHaveAccessibleName(/\S/)
      }
    }
  }
})
