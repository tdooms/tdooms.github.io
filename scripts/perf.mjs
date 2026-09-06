#!/usr/bin/env node
import assert from 'node:assert/strict'
import { glob, mkdir, mkdtemp, readFile, rename, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export function validateConfig(config) {
  assert(
    Number.isInteger(config.numberOfRuns) && config.numberOfRuns > 0,
    'numberOfRuns must be a positive integer',
  )
  for (const [key, maximum] of [
    ['minimumScores', 1],
    ['maximumValues', Infinity],
  ]) {
    const budgets = config[key]
    assert(
      budgets &&
        typeof budgets === 'object' &&
        !Array.isArray(budgets) &&
        Object.keys(budgets).length,
      `${key} must contain budgets`,
    )
    for (const [name, value] of Object.entries(budgets)) {
      assert(
        Number.isFinite(value) && value >= 0 && value <= maximum,
        `Invalid ${key} budget for ${name}: ${value}`,
      )
    }
  }
}

export async function discoverPages(dist) {
  assert((await stat(dist)).isDirectory(), `Build directory missing: ${dist}`)
  const pages = []
  for await (const file of glob('**/*.html', { cwd: dist })) {
    pages.push(
      '/' +
        file
          .split(path.sep)
          .map(encodeURIComponent)
          .join('/')
          .replace(/(^|\/)index\.html$/, '$1'),
    )
  }
  assert(pages.length, `No built HTML pages in ${dist}`)
  return pages.sort()
}

export function checkBudgets(reports, config) {
  validateConfig(config)
  assert.equal(reports.length, config.numberOfRuns, 'Incomplete Lighthouse run set')
  const checks = []
  for (const [name, limit] of Object.entries(config.minimumScores)) {
    const values = reports.map((report) => report.categories?.[name]?.score)
    const actual = values.every(Number.isFinite) ? Math.max(...values) : null
    checks.push({
      name,
      values,
      actual,
      limit,
      comparison: '>=',
      passed: actual !== null && actual >= limit,
    })
  }
  for (const [name, limit] of Object.entries(config.maximumValues)) {
    const values = reports.map((report) => report.audits?.[name]?.numericValue)
    const actual = values.every(Number.isFinite) ? Math.min(...values) : null
    checks.push({
      name,
      values,
      actual,
      limit,
      comparison: '<=',
      passed: actual !== null && actual <= limit,
    })
  }
  return checks
}

async function main() {
  const config = JSON.parse(await readFile('lighthouse.config.json', 'utf8'))
  validateConfig(config)
  const allPages = await discoverPages('dist')
  const requested = process.argv.slice(2)
  for (const page of requested) assert(allPages.includes(page), `Unknown built page: ${page}`)
  const pages = requested.length ? [...new Set(requested)] : allPages

  const [
    { preview },
    { default: lighthouse },
    { default: desktopConfig },
    { launch, killAll },
    { chromium },
  ] = await Promise.all([
    import('astro'),
    import('lighthouse'),
    import('lighthouse/core/config/desktop-config.js'),
    import('chrome-launcher'),
    import('@playwright/test'),
  ])
  await mkdir('.lighthouseci', { recursive: true })
  const outputDir = await mkdtemp(path.resolve('.lighthouseci/run-'))
  console.log(
    `Lighthouse: ${pages.length} pages × ${config.numberOfRuns} desktop runs. Reports: ${outputDir}`,
  )
  const server = await preview({
    server: { host: '127.0.0.1', port: 0, open: false },
    logLevel: 'error',
  })
  let chrome
  const summary = []
  const interrupt = () => {
    process.exitCode = 130
    killAll()
  }
  process.once('SIGINT', interrupt)
  process.once('SIGTERM', interrupt)
  try {
    chrome = await launch({
      chromePath: process.env.CHROME_PATH ?? chromium.executablePath(),
      chromeFlags: ['--headless', '--no-sandbox'],
      handleSIGINT: false,
    })
    for (const [pageIndex, page] of pages.entries()) {
      const reports = []
      for (let run = 1; run <= config.numberOfRuns; run++) {
        console.log(`${page} · run ${run}/${config.numberOfRuns}`)
        const result = await lighthouse(
          `http://127.0.0.1:${server.port}${page}`,
          { port: chrome.port, output: ['html', 'json'], logLevel: 'error' },
          {
            ...desktopConfig,
            settings: { ...desktopConfig.settings, throttlingMethod: 'simulate' },
          },
        )
        assert(result, `Lighthouse returned no result for ${page}`)
        const stem = path.join(outputDir, `${pageIndex + 1}-${run}`)
        await writeFile(`${stem}.html`, result.report[0])
        await writeFile(`${stem}.json`, result.report[1])
        assert(!result.lhr.runtimeError, `${page}: ${result.lhr.runtimeError?.message}`)
        reports.push(result.lhr)
      }
      // Preserve LHCI's default optimistic aggregation: the best value per metric.
      // A missing measurement is a failure even if another run has a value.
      const checks = checkBudgets(reports, config)
      summary.push({ page, checks })
      const summaryPath = path.join(outputDir, 'summary.json')
      await writeFile(`${summaryPath}.tmp`, JSON.stringify(summary, null, 2) + '\n')
      await rename(`${summaryPath}.tmp`, summaryPath)
      for (const check of checks.filter((check) => !check.passed)) {
        console.error(
          `FAIL ${page} ${check.name}: ${check.actual ?? 'missing measurement'} (required ${check.comparison} ${check.limit})`,
        )
      }
    }
    const failures = summary.flatMap(({ checks }) => checks).filter((check) => !check.passed)
    console.log(
      `${failures.length ? 'FAIL' : 'PASS'}: ${pages.length} pages, ${failures.length} failed budgets. Reports: ${outputDir}`,
    )
    if (failures.length) process.exitCode = 1
  } finally {
    process.removeListener('SIGINT', interrupt)
    process.removeListener('SIGTERM', interrupt)
    await Promise.all([server.stop(), chrome?.kill()])
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main()
}
