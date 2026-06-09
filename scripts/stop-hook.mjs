#!/usr/bin/env node
// Claude Code Stop hook: comprehensive smoke check before the assistant is
// allowed to claim a task is done. Runs the whole quality gate the user has
// asked for ("everything that can be checked must be checked"):
//
//   1. astro check          — type errors across .astro / .svelte / .ts
//   2. prettier --check     — formatting drift
//   3. astro build          — build succeeds at all
//   4. check-links.mjs      — every internal `<a href>` in dist/ resolves
//   5. playwright test      — runtime: no JS errors, layouts don't collapse,
//                             no overlapping interactives, bae explorer
//                             click interception works, etc.
//
// Behaviour:
//   * all pass    → exit 0, assistant stops normally
//   * any fails   → output `{"decision":"block", "reason": ...}`, assistant
//                   sees the failure and is forced to keep working
//   * second pass → `stop_hook_active: true` arrives on stdin; we exit 0 to
//                   avoid an infinite loop (one retry, not endless)
//
// Total runtime: ~40 s cold (build + tests), ~25 s warm (build cached,
// Playwright reuses the preview server). The user explicitly chose blocking
// over time — see [feedback-run-browser-tests-before-done].

import { spawnSync } from 'node:child_process'
import { readFileSync, rmSync } from 'node:fs'

let input = {}
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}')
} catch {
  // stdin not JSON — run anyway with empty input
}

if (input.stop_hook_active) process.exit(0)

const isWin = process.platform === 'win32'

// Stale `dist/.prerender/` entries from a prior build can confuse Astro 6's
// default-prerenderer on Windows ("Cannot find module prerender-entry.HASH.mjs"
// imported from default-prerenderer.js"). The playwright webServer (run in the
// previous Stop-hook invocation) builds into `dist/` and the artifacts
// sometimes outlive cleanly. Wipe `dist/` before the build step so each gate
// run starts from a clean slate. Adds ~100 ms; saves a flaky build.
rmSync('dist', { recursive: true, force: true })

const steps = [
  ['type-check', 'bun', ['run', 'astro', 'check']],
  ['format', 'bunx', ['prettier', '--check', 'src/', 'tests/', 'scripts/']],
  ['build', 'bun', ['run', 'build']],
  ['link-check', 'node', ['scripts/check-links.mjs']],
  ['playwright', 'bun', ['run', 'test', '--reporter=line']],
]

const failures = []

for (const [name, cmd, args] of steps) {
  const res = spawnSync(cmd, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: isWin,
  })
  if (res.status !== 0) {
    const out = (res.stdout?.toString() ?? '') + (res.stderr?.toString() ?? '')
    const tail = out.split('\n').slice(-30).join('\n')
    failures.push({ name, tail })
    // Don't short-circuit — surface every failing gate in one report so the
    // assistant doesn't fix one and ship still broken on another.
  }
}

if (failures.length === 0) process.exit(0)

const reason =
  `${failures.length}/${steps.length} pre-stop check(s) failed — fix before stopping.\n\n` +
  failures.map((f) => `── ${f.name} ──\n${f.tail}`).join('\n\n')

process.stdout.write(JSON.stringify({ decision: 'block', reason }))
process.exit(0)
