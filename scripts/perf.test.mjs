import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { checkBudgets, discoverPages, validateConfig } from './perf.mjs'

test('discovers every built page, including nested and encoded paths', async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'website-perf-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  for (const file of [
    'index.html',
    '404.html',
    'blog/one/index.html',
    'research/two/index.html',
    'a/b/c/d/index.html',
    'café notes.html',
    'resume/index.html',
    'favicon.svg',
  ]) {
    const destination = path.join(directory, file)
    await mkdir(path.dirname(destination), { recursive: true })
    await writeFile(destination, '')
  }
  assert.deepEqual(await discoverPages(directory), [
    '/',
    '/404.html',
    '/a/b/c/d/',
    '/blog/one/',
    '/caf%C3%A9%20notes.html',
    '/research/two/',
    '/resume/',
  ])
})

test('rejects a missing or empty build instead of reporting success', async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'website-perf-empty-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  await assert.rejects(discoverPages(path.join(directory, 'missing')), /ENOENT/)
  await assert.rejects(discoverPages(directory), /No built HTML pages/)
})

test('keeps the best value per metric across runs and fails exceeded budgets', () => {
  const config = {
    numberOfRuns: 3,
    minimumScores: { performance: 1, accessibility: 1 },
    maximumValues: { 'first-contentful-paint': 700, 'total-blocking-time': 50 },
  }
  const reports = [
    {
      categories: { performance: { score: 1 }, accessibility: { score: 0.9 } },
      audits: {
        'first-contentful-paint': { numericValue: 900 },
        'total-blocking-time': { numericValue: 80 },
      },
    },
    {
      categories: { performance: { score: 0.8 }, accessibility: { score: 0.95 } },
      audits: {
        'first-contentful-paint': { numericValue: 650 },
        'total-blocking-time': { numericValue: 51 },
      },
    },
    {
      categories: { performance: { score: 0.9 }, accessibility: { score: 0.8 } },
      audits: {
        'first-contentful-paint': { numericValue: 800 },
        'total-blocking-time': { numericValue: 60 },
      },
    },
  ]
  const checks = checkBudgets(reports, config)
  assert.deepEqual(
    checks.map(({ name, actual, passed }) => ({ name, actual, passed })),
    [
      { name: 'performance', actual: 1, passed: true },
      { name: 'accessibility', actual: 0.95, passed: false },
      { name: 'first-contentful-paint', actual: 650, passed: true },
      { name: 'total-blocking-time', actual: 51, passed: false },
    ],
  )
})

test('missing and nonfinite measurements fail even beside successful runs', () => {
  const config = {
    numberOfRuns: 2,
    minimumScores: { performance: 1 },
    maximumValues: { 'first-contentful-paint': 700 },
  }
  const valid = {
    categories: { performance: { score: 1 } },
    audits: { 'first-contentful-paint': { numericValue: 100 } },
  }
  const invalid = { categories: {}, audits: { 'first-contentful-paint': { numericValue: NaN } } }
  assert(
    checkBudgets([valid, invalid], config).every(
      ({ passed, actual }) => !passed && actual === null,
    ),
  )
  assert.throws(() => checkBudgets([valid], config), /Incomplete Lighthouse run set/)
})

test('rejects empty and invalid budget configuration before starting browsers', () => {
  assert.throws(() => validateConfig({ numberOfRuns: 0 }), /positive integer/)
  assert.throws(
    () => validateConfig({ numberOfRuns: 3, minimumScores: {} }),
    /must contain budgets/,
  )
  assert.throws(
    () => validateConfig({ numberOfRuns: 3, minimumScores: { performance: 1.1 } }),
    /Invalid minimumScores/,
  )
  assert.throws(
    () =>
      validateConfig({
        numberOfRuns: 3,
        minimumScores: { performance: 1 },
        maximumValues: { 'first-contentful-paint': -1 },
      }),
    /Invalid maximumValues/,
  )
})
