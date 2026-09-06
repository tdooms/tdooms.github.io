#!/usr/bin/env node
// Check static anchor destinations in built HTML. Queries do not affect the
// output file; HTML fragments must identify an element in the target document.
// Optional argument: output directory (defaults to dist).
import { readFileSync, statSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'parse5'

const dist = path.resolve(process.argv[2] ?? 'dist')
if (!statSync(dist, { throwIfNoEntry: false })?.isDirectory()) {
  console.error(`✗ link-check: build directory missing: ${dist}`)
  process.exit(1)
}

// Parse each document once, including HTML entities and all attribute quoting
// forms. Template contents are inert, so only live document nodes are visited.
const pages = new Map()
for await (const file of glob('**/*.html', { cwd: dist })) {
  const ids = new Set()
  const hrefs = []
  let canonical
  const nodes = [parse(readFileSync(path.join(dist, file), 'utf8'))]
  while (nodes.length) {
    const node = nodes.pop()
    const attrs = Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]))
    if (attrs.id !== undefined) ids.add(attrs.id)
    if (node.tagName === 'a') {
      if (attrs.name !== undefined) ids.add(attrs.name)
      if (attrs.href !== undefined) hrefs.push(attrs.href)
    }
    if (node.tagName === 'link' && attrs.rel?.toLowerCase().split(/\s+/).includes('canonical')) {
      canonical = attrs.href
    }
    nodes.push(...(node.childNodes ?? []))
  }
  const origin = canonical ? new URL(canonical, 'http://localhost').origin : 'http://localhost'
  const pathname =
    '/' +
    file
      .split(path.sep)
      .map(encodeURIComponent)
      .join('/')
      .replace(/(^|\/)index\.html$/, '$1')
  pages.set(path.join(dist, file), { ids, hrefs, url: new URL(pathname, origin) })
}

if (pages.size === 0) {
  console.error(`✗ link-check: no built HTML files in ${dist}`)
  process.exit(1)
}

function resolveFile(pathname) {
  const decoded = decodeURIComponent(pathname)
  const absolute = path.resolve(dist, `.${decoded}`)
  if (absolute !== dist && !absolute.startsWith(dist + path.sep)) return undefined
  const candidates = decoded.endsWith('/')
    ? [path.join(absolute, 'index.html')]
    : [absolute, path.join(absolute, 'index.html'), `${absolute}.html`]
  return candidates.find((candidate) => statSync(candidate, { throwIfNoEntry: false })?.isFile())
}

const broken = []
const checked = new Set()
for (const [file, page] of pages) {
  for (const href of page.hrefs) {
    let target
    try {
      target = new URL(href, page.url)
    } catch {
      broken.push({ from: file, href, reason: 'invalid URL' })
      continue
    }
    if (!['http:', 'https:'].includes(target.protocol) || target.origin !== page.url.origin)
      continue
    const key = `${file}\0${target.href}`
    if (checked.has(key)) continue
    checked.add(key)

    let destination
    let fragment
    try {
      destination = resolveFile(target.pathname)
      // Text-fragment directives do not name an HTML element.
      fragment = decodeURIComponent(target.hash.slice(1).split(':~:')[0])
    } catch (error) {
      if (!(error instanceof URIError)) throw error
      broken.push({ from: file, href, reason: 'invalid percent encoding' })
      continue
    }
    if (!destination) {
      broken.push({ from: file, href, reason: 'missing file' })
    } else if (
      fragment &&
      pages.has(destination) &&
      !pages.get(destination).ids.has(fragment) &&
      fragment.toLowerCase() !== 'top'
    ) {
      broken.push({ from: file, href, reason: `missing HTML fragment #${fragment}` })
    }
  }
}

if (broken.length === 0) {
  console.log(
    `✓ link-check: ${checked.size} internal hrefs across ${pages.size} pages, all resolve`,
  )
} else {
  console.error(`✗ link-check: ${broken.length} broken internal link(s)`)
  for (const { from, href, reason } of broken) {
    console.error(`  ${path.relative(dist, from)} → ${JSON.stringify(href)} (${reason})`)
  }
  process.exitCode = 1
}
