import { tableFromIPC, Type } from 'apache-arrow'

/**
 * Decode an Arrow IPC buffer into ``{column: TypedArray}``. ``FixedSizeList``
 * columns (e.g. per-row hover context) collapse to the underlying flat
 * TypedArray. Arrow joins record batches when a column spans multiple buffers.
 * Generic; not specific to the manifold dump.
 *
 * Caller narrows the column shape with ``parseIPC<MyCols>(buffer)``.
 */
export function parseIPC<T = Record<string, ArrayLike<number>>>(buffer: ArrayBuffer): T {
  const table = tableFromIPC(new Uint8Array(buffer))
  const cols: Record<string, ArrayLike<number>> = {}
  for (const f of table.schema.fields) {
    const column = table.getChild(f.name)
    if (!column || column.nullCount) {
      throw new Error(`Arrow column ${f.name} is missing or contains nulls`)
    }
    const values = f.type.typeId === Type.FixedSizeList ? column.getChildAt(0) : column
    if (!values || values.nullCount) {
      throw new Error(`Arrow column ${f.name} has missing or null values`)
    }
    cols[f.name] = values.toArray()
  }
  return cols as T
}
