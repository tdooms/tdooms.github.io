import { tableFromIPC, Type } from "apache-arrow";

/**
 * Decode an Arrow IPC buffer into ``{column: TypedArray}``. ``FixedSizeList``
 * columns (e.g. per-row hover context) collapse to the underlying flat
 * TypedArray — Arrow stores them contiguously, so we get the whole buffer for
 * free. Generic; not specific to the manifold dump.
 *
 * Caller narrows the column shape with ``parseIPC<MyCols>(buffer)``.
 */
export function parseIPC<T = Record<string, ArrayLike<number>>>(buffer: ArrayBuffer): T {
  const table = tableFromIPC(new Uint8Array(buffer));
  const cols: Record<string, ArrayLike<number>> = {};
  for (const f of table.schema.fields) {
    const data = table.getChild(f.name)!.data[0];
    cols[f.name] = f.type.typeId === Type.FixedSizeList
      ? data.children[0].values
      : table.getChild(f.name)!.toArray();
  }
  return cols as T;
}
