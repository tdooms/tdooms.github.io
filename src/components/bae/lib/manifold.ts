// Manifold data layer. The wire format ships xyz coords as int16 in
// [-32767, 32767] and activations as int8 in [-127, 127]; both rescale to
// unit ranges so the renderer never multiplies scaling factors it shouldn't
// know about. This is the only file that knows the wire scaling.
import type { ClusterData, Meta, PointsData } from './types'

const INT16_TO_UNIT = 1 / 32767
const INT8_TO_UNIT = 1 / 127

// Shape of the columnar feather emitted by Python's manifold dump.
interface ManifoldFeather {
  x: ArrayLike<number> // int16
  y: ArrayLike<number>
  z: ArrayLike<number>
  h: ArrayLike<number> // int8
  context: Uint32Array // flat per-row original tokenizer ids
}

// Shape of ``cluster.json`` from ``uv run cluster <id>``.
interface ClusterMap {
  cluster_per_point: number[]
  clusters: { id: number; label: string; centroid: [number, number, number] }[]
}

/**
 * Decode a manifold composite into render-ready point data. Caller passes the
 * Arrow-decoded ``feather`` columns, the per-composite ``meta`` JSON, the
 * shared ``vocab``, and (optionally) a ``map.json`` cluster payload. We return
 * everything the renderer needs in unit-ball / unit-activation space.
 */
export function dequantize(
  feather: ManifoldFeather,
  meta: Meta,
  vocab: Record<string, string>,
  clusterMap: ClusterMap | null = null,
): PointsData {
  const n = feather.x.length
  if (!n || feather.y.length !== n || feather.z.length !== n || feather.h.length !== n) {
    throw new Error(
      `Composite ${meta.latent_id}: manifold columns must contain the same nonzero row count`,
    )
  }
  if (!feather.context.length || feather.context.length % n !== 0) {
    throw new Error(
      `Composite ${meta.latent_id}: context must contain a complete window for every point`,
    )
  }
  const contextLength = feather.context.length / n
  // Validate the complete token join while Explorer can still report a load
  // error. Rendering a context must not discover an incomplete vocabulary.
  for (let offset = 0; offset < feather.context.length; offset++) {
    const id = feather.context[offset]!
    if (typeof vocab?.[id] !== 'string') {
      throw new Error(
        `Composite ${meta.latent_id}: Missing vocabulary token ${id} at point ${Math.floor(offset / contextLength)}`,
      )
    }
  }
  if (meta.eigvals.length < 3 || !meta.eigvals.every(Number.isFinite)) {
    throw new Error(
      `Composite ${meta.latent_id}: 3D projection requires at least three finite eigenvalues`,
    )
  }
  if (meta.origin.length !== 3 || !meta.origin.every(Number.isFinite)) {
    throw new Error(`Composite ${meta.latent_id}: origin requires three finite coordinates`)
  }
  if (clusterMap && clusterMap.cluster_per_point.length !== n) {
    throw new Error(`Composite ${meta.latent_id}: cluster assignments must cover every point`)
  }
  const xyz = new Float32Array(n * 3)
  const activation = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = feather.x[i],
      y = feather.y[i],
      z = feather.z[i],
      h = feather.h[i]
    if (
      x === undefined ||
      y === undefined ||
      z === undefined ||
      h === undefined ||
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(z) ||
      !Number.isFinite(h)
    ) {
      throw new Error(`Composite ${meta.latent_id}: non-finite manifold value at row ${i}`)
    }
    xyz[3 * i] = x * INT16_TO_UNIT
    xyz[3 * i + 1] = y * INT16_TO_UNIT
    xyz[3 * i + 2] = z * INT16_TO_UNIT
    activation[i] = h * INT8_TO_UNIT
  }
  // Top-3 eigenvalues by |λ| — the eigenvectors that x/y/z were projected onto
  // in the manifold dump (see ``analysis/manifold.py``). Used to colour the
  // axes gizmo by sign and magnitude.
  const eigvals = [...meta.eigvals]
    .map((v, i) => [Math.abs(v), v, i] as const)
    .sort((a, b) => b[0] - a[0])
    .slice(0, 3)
    .map((t) => t[1]) as [number, number, number]
  return {
    n,
    xyz,
    activation,
    context: feather.context,
    contextLength,
    vocab,
    origin: meta.origin,
    eigvals,
    clusters: clusterMap && dequantizeClusters(clusterMap),
  }
}

// ``map.json`` ships centroids in the same int16 unit-ball space as the
// points; dequantize once at load so the renderer reads pure floats.
function dequantizeClusters(map: ClusterMap): ClusterData {
  return {
    assignment: Int32Array.from(map.cluster_per_point),
    centroids: map.clusters.map((c) => ({
      id: c.id,
      label: c.label,
      xyz: [
        c.centroid[0] * INT16_TO_UNIT,
        c.centroid[1] * INT16_TO_UNIT,
        c.centroid[2] * INT16_TO_UNIT,
      ],
    })),
  }
}
