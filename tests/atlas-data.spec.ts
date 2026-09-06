import { test, expect } from '@playwright/test'
import {
  Field,
  FixedSizeList,
  Uint32,
  Table,
  tableFromArrays,
  tableToIPC,
  vectorFromArray,
} from 'apache-arrow'
import { parseIPC } from '../src/components/bae/lib/arrow'
import { dequantize } from '../src/components/bae/lib/manifold'
import type { Meta } from '../src/components/bae/lib/types'

const meta: Meta = {
  latent_id: 42,
  eigvals: [-1, 0.5, 2],
  origin: [0, 0, 0],
  histogram: { counts: [2], edges: [-1, 1] },
  neighbours: [],
}
const vocab = { 1: 'alpha', 2: ' beta', 3: ' gamma' }

test('Arrow record batches preserve every point and its complete token window', () => {
  const batches = [-1, 1].flatMap((sign) => {
    const table = new Table({
      x: vectorFromArray(new Int16Array([sign * 32767])),
      y: vectorFromArray(new Int16Array([0])),
      z: vectorFromArray(new Int16Array([0])),
      h: vectorFromArray(new Int8Array([sign * 127])),
      context: vectorFromArray(
        [sign < 0 ? [1, 2, 3] : [3, 2, 1]],
        new FixedSizeList(3, new Field('item', new Uint32(), false)),
      ),
    })
    return table.batches
  })
  expect(batches).toHaveLength(2)
  const buffer = new Uint8Array(tableToIPC(new Table(batches))).buffer
  const columns = parseIPC<Parameters<typeof dequantize>[0]>(buffer)
  const points = dequantize(columns, meta, vocab)
  expect(points.n).toBe(2)
  expect(Array.from(points.xyz)).toEqual([-1, 0, 0, 1, 0, 0])
  expect(Array.from(points.activation)).toEqual([-1, 1])
  expect(Array.from(points.context)).toEqual([1, 2, 3, 3, 2, 1])
  expect(points.contextLength).toBe(3)
  expect(points.eigvals).toEqual([2, -1, 0.5])
})

test('Arrow nulls fail instead of becoming numeric zeroes', () => {
  const buffer = new Uint8Array(tableToIPC(tableFromArrays({ x: [1, null] }))).buffer
  expect(() => parseIPC(buffer)).toThrow(/column x.*null/)
})

test('malformed manifold rows fail before creating render buffers', () => {
  const columns = {
    x: new Int16Array([1, 2]),
    y: new Int16Array([1, 2]),
    z: new Int16Array([1, 2]),
    h: new Int8Array([1, 2]),
    context: new Uint32Array([1, 2, 3, 3, 2, 1]),
  }
  expect(() => dequantize({ ...columns, y: new Int16Array([1]) }, meta, vocab)).toThrow(
    /Composite 42:.*row count/,
  )
  expect(() =>
    dequantize({ ...columns, context: new Uint32Array([1, 2, 3]) }, meta, vocab),
  ).toThrow(/Composite 42:.*complete window/)
  expect(() => dequantize({ ...columns, x: [1, NaN] }, meta, vocab)).toThrow(
    /Composite 42:.*non-finite.*row 1/,
  )
  // A missing token on a zero-activation point still violates the full join,
  // even though that point never appears in the top-activation list.
  expect(() =>
    dequantize(
      {
        ...columns,
        h: new Int8Array([1, 0]),
        context: new Uint32Array([1, 2, 1, 2, 1, 3]),
      },
      meta,
      { 1: 'alpha', 2: ' beta' },
    ),
  ).toThrow(/Composite 42: Missing vocabulary token 3 at point 1/)
  expect(() => dequantize(columns, meta, { ...vocab, 3: '' })).not.toThrow()
})
