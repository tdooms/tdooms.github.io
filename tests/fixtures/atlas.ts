import { test as base, expect } from '@playwright/test'
import {
  Field,
  FixedSizeList,
  Uint32,
  Table,
  tableFromArrays,
  tableToIPC,
  vectorFromArray,
} from 'apache-arrow'
import manifest from '../../src/components/bae/lib/manifest.json' with { type: 'json' }

// Small transport fixture for browser interactions. The live-data smoke tests
// separately cover the published dataset; these tests exercise real Arrow decoding.
const index = Buffer.from(
  tableToIPC(
    tableFromArrays({
      latent_id: new Uint32Array([1627, 1628]),
      density: new Float32Array([0.1, 0.4]),
      eff_rank: new Float32Array([2, 3]),
      importance: new Float32Array([0.7, 0.3]),
      support: new Uint16Array([3, 4]),
      umap_x: new Float32Array([-1, 1]),
      umap_y: new Float32Array([1, -1]),
    }),
  ),
)

const points = Buffer.from(
  tableToIPC(
    new Table({
      x: vectorFromArray(new Int16Array([-16000, 16000, 0, 8000])),
      y: vectorFromArray(new Int16Array([0, 8000, -16000, 16000])),
      z: vectorFromArray(new Int16Array([8000, 0, 16000, -8000])),
      h: vectorFromArray(new Int8Array([-127, 127, -64, 64])),
      context: vectorFromArray(
        [
          [1, 2, 3],
          [3, 2, 1],
          [1, 3, 2],
          [2, 1, 3],
        ],
        new FixedSizeList(3, new Field('item', new Uint32(), false)),
      ),
    }),
  ),
)

export const test = base.extend({
  context: async ({ context }, use) => {
    const root = `/${manifest.base}/${manifest.name}/`
    const headers = { 'access-control-allow-origin': '*' }
    await context.route(
      (url) => url.pathname.startsWith(root),
      async (route) => {
        const file = new URL(route.request().url()).pathname.slice(root.length)
        if (file === 'index.feather' || /^latent_\d+\.feather$/.test(file)) {
          await route.fulfill({
            headers,
            contentType: 'application/octet-stream',
            body: file === 'index.feather' ? index : points,
          })
          return
        }
        const json: Record<string, unknown> = {
          'vocab.json': { 1: 'alpha', 2: ' beta', 3: ' gamma' },
          'curated.json': { labels: { 1627: 'Alpha contexts', 1628: 'Beta contexts' } },
          'clusters.json': [1627, 1628],
        }
        const latent = /^latent_(\d+)\.json$/.exec(file)
        if (latent?.[1]) {
          const id = Number(latent[1])
          json[file] = {
            latent_id: id,
            eigvals: [-1, 0.5, 2],
            origin: [0, 0, 0],
            histogram: { counts: [1, 2], edges: [-1, 0, 1] },
            neighbours: [[id === 1627 ? 1628 : 1627, 0.5]],
          }
        }
        if (Object.hasOwn(json, file)) await route.fulfill({ headers, json: json[file] })
        else
          await route.fulfill({
            headers,
            status: 404,
            body: 'No cluster annotation in this fixture',
          })
      },
    )
    await use(context)
  },
})

export { expect }
