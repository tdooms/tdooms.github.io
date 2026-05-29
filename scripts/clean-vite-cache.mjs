import { rmSync } from 'node:fs'

for (const dir of ['node_modules/.vite', 'node_modules/.astro']) {
  rmSync(dir, { recursive: true, force: true })
}
