#!/usr/bin/env node
// Static internal-link checker. Walks every built `dist/**/*.html`, extracts
// every `<a href="…">` whose value is same-origin, and verifies the target
// resolves to a real built file (or, for the bae explorer, the documented
// query-param contract). Fails with a list of broken sources → targets.
//
// Static = no browser, no server. Run after `bun run build`. Order of
// magnitude faster than Playwright crawling, catches things Playwright
// click-by-click would miss (e.g. a link nested in a hidden sidebar that the
// browser never renders).
//
// Exits 0 if all links resolve. Exits 1 with a structured report otherwise.

import { readFileSync, statSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import path from 'node:path'

const DIST = path.resolve('dist')

// The bae explorer routes everything through `?composite=…` / `?experiment=…`
// rather than nested pages. The bae verbatim components still emit
// `${base}/composite/${id}` href values; our click-delegation handler in
// `Explorer.svelte` rewrites them at runtime. These paths must NOT count as
// broken — they're a documented contract handled in JS.
const EXPLORER_BASE = '/bae'
const ALLOWED_VIRTUAL = [
  new RegExp(`^${EXPLORER_BASE}/composite/\\d+/?$`),
  new RegExp(`^${EXPLORER_BASE}/experiments(/[^/]+)?/?$`),
]

const isAllowedVirtual = (p) => ALLOWED_VIRTUAL.some((r) => r.test(p))

// True iff dist contains either `<pathname>` (a file) or `<pathname>/index.html`.
function resolvesInDist(pathname) {
  const rel = pathname.replace(/^\//, '') // strip leading slash
  const stripped = rel.replace(/\/$/, '') // strip trailing slash
  const candidates = [
    path.join(DIST, rel),
    path.join(DIST, rel, 'index.html'),
    path.join(DIST, stripped, 'index.html'),
    path.join(DIST, `${stripped}.html`),
  ]
  for (const c of candidates) {
    try {
      const s = statSync(c)
      if (s.isFile()) return true
    } catch {
      // not present, try next candidate
    }
  }
  return false
}

const hrefRe = /<a\b[^>]*\shref\s*=\s*"([^"#?]*)(?:[#?][^"]*)?"/gi

const broken = [] // { from, to }
const checked = new Set()

for await (const file of glob('**/*.html', { cwd: DIST })) {
  const abs = path.join(DIST, file)
  const html = readFileSync(abs, 'utf8')
  for (const m of html.matchAll(hrefRe)) {
    const raw = m[1]
    if (!raw) continue
    // Skip absolute URLs, schemes, anchors, mailto/tel.
    if (/^[a-z]+:/i.test(raw)) continue
    if (raw.startsWith('//')) continue
    if (!raw.startsWith('/')) continue // ignore relative-from-current (rare in Astro output)
    const target = raw

    const key = `${file}::${target}`
    if (checked.has(key)) continue
    checked.add(key)

    if (isAllowedVirtual(target)) continue
    if (resolvesInDist(target)) continue
    broken.push({ from: '/' + file.replace(/\\/g, '/'), to: target })
  }
}

if (broken.length === 0) {
  console.log(`✓ link-check: ${checked.size} internal hrefs, all resolve`)
  process.exit(0)
}

console.error(`✗ link-check: ${broken.length} broken internal link(s)\n`)
const byTarget = new Map()
for (const { from, to } of broken) {
  if (!byTarget.has(to)) byTarget.set(to, [])
  byTarget.get(to).push(from)
}
for (const [to, froms] of byTarget) {
  console.error(`  → ${to}`)
  for (const from of froms.slice(0, 5)) console.error(`      from ${from}`)
  if (froms.length > 5) console.error(`      …and ${froms.length - 5} more`)
}
process.exit(1)
