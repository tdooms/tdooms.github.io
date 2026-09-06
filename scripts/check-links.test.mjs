import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const script = fileURLToPath(new URL('./check-links.mjs', import.meta.url))

function fixture(t, files) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'website-links-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  for (const [file, html] of Object.entries(files)) {
    const destination = path.join(directory, file)
    mkdirSync(path.dirname(destination), { recursive: true })
    writeFileSync(destination, html)
  }
  return directory
}

function check(directory) {
  const result = spawnSync(process.execPath, [script, directory], {
    encoding: 'utf8',
    timeout: 5000,
  })
  assert.ifError(result.error)
  return result
}

test('resolves real local URLs, HTML attributes, and encoded fragments', (t) => {
  const directory = fixture(t, {
    'index.html': `<link rel="canonical" href="https://personal.example/">
      <h1 id="home">Home</h1><a href="#home">Home</a><a href="#">Top</a>
      <a href="https://personal.example/docs/?q=a&amp;b=c#part%20one">Absolute</a>
      <a href='//personal.example/docs/#part%20one'>Protocol-relative</a>
      <a href=/docs/#part%20one>Unquoted</a>
      <a href="/resume.pdf#page=2">PDF</a><a href="/bae/?composite=1627">Atlas</a>
      <a href="https://elsewhere.example/missing">External</a>
      <a href="mailto:person@example.org">Email</a>
      <script>const example = '<a href="/not-an-anchor">';</script>`,
    'docs/index.html': `<link rel="canonical" href="https://personal.example/docs/">
      <h2 id="part one">Part</h2><h2 id="a&amp;b">Entities</h2>
      <a href="../#home">Parent</a><a href="./child.html#details">Sibling</a>
      <a href="?a=1&amp;b=2#a&amp;b">Query and decoded ID</a>
      <a href="../caf%C3%A9%20notes.html#r%C3%A9sum%C3%A9">Encoded filename</a>`,
    'docs/child.html': '<h2 id="details">Details</h2>',
    'café notes.html': '<h2 id="résumé">Résumé</h2>',
    'bae/index.html': '<h1>Atlas</h1>',
    'resume.pdf': 'fixture asset',
  })
  const result = check(directory)
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /internal hrefs across 5 pages, all resolve/)
})

test('reports same-origin, relative, fragment, and former virtual-route failures', (t) => {
  const directory = fixture(t, {
    'index.html': `<link rel="canonical" href="https://personal.example/">
      <a href="https://personal.example/absent">Absolute</a>
      <a href='relative.html'>Relative</a><a href="/docs/#absent">Missing ID</a>
      <a href="#same-page-missing">Same-page ID</a>
      <a href="/bae/composite/1627">Former virtual route</a>`,
    'docs/index.html': '<h2 id="present">Present</h2>',
    'bae/index.html': '<h1>Atlas</h1>',
  })
  const result = check(directory)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /5 broken internal link\(s\)/)
  for (const target of [
    'https://personal.example/absent',
    'relative.html',
    '/docs/#absent',
    '#same-page-missing',
    '/bae/composite/1627',
  ]) {
    assert.ok(result.stderr.includes(target), `missing diagnostic for ${target}`)
  }
  assert.match(result.stderr, /missing HTML fragment #absent/)
})

test('uses localhost for documents without a canonical link', (t) => {
  const directory = fixture(t, {
    'index.html': '<a href="http://localhost/missing">Local absolute URL</a>',
  })
  const result = check(directory)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /http:\/\/localhost\/missing/)
})

test('rejects missing and empty build directories', (t) => {
  const directory = fixture(t, {})
  const missing = check(path.join(directory, 'missing'))
  assert.equal(missing.status, 1)
  assert.match(missing.stderr, /build directory missing/)
  const empty = check(directory)
  assert.equal(empty.status, 1)
  assert.match(empty.stderr, /no built HTML files/)
})
