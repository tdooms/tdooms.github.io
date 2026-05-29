// Manifold data layer. The wire format ships xyz coords as int16 in
// [-32767, 32767] and activations as int8 in [-127, 127]; both rescale to
// unit ranges so the renderer never multiplies scaling factors it shouldn't
// know about. This is the only file that knows the wire scaling.
import type { ClusterData, Meta, PointsData } from "./types";

const INT16_TO_UNIT = 1 / 32767;
const INT8_TO_UNIT  = 1 / 127;

// Shape of the columnar feather emitted by Python's manifold dump.
interface ManifoldFeather {
  x: ArrayLike<number>;                                                      // int16
  y: ArrayLike<number>;
  z: ArrayLike<number>;
  h: ArrayLike<number>;                                                      // int8
  context: Int32Array;                                                       // flat per-row int32 token ids
}

// Shape of ``cluster.json`` from ``uv run cluster <id>``.
interface ClusterMap {
  cluster_per_point: Int32Array;
  clusters: { id: number; label: string; centroid: [number, number, number] }[];
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
  const n = feather.x.length;
  const xyz = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    xyz[3 * i]     = feather.x[i] * INT16_TO_UNIT;
    xyz[3 * i + 1] = feather.y[i] * INT16_TO_UNIT;
    xyz[3 * i + 2] = feather.z[i] * INT16_TO_UNIT;
  }
  const activation = new Float32Array(n);
  for (let i = 0; i < n; i++) activation[i] = feather.h[i] * INT8_TO_UNIT;
  // Top-3 eigenvalues by |λ| — the eigenvectors that x/y/z were projected onto
  // in the manifold dump (see ``analysis/manifold.py``). Used to colour the
  // axes gizmo by sign and magnitude.
  const eigvals = [...meta.eigvals]
    .map((v, i) => [Math.abs(v), v, i] as const)
    .sort((a, b) => b[0] - a[0])
    .slice(0, 3)
    .map((t) => t[1]) as [number, number, number];
  return {
    n,
    xyz,
    activation,
    context: feather.context,
    contextLength: feather.context.length / n,
    vocab,
    origin: meta.origin,
    eigvals,
    clusters: clusterMap && dequantizeClusters(clusterMap),
  };
}

// ``map.json`` ships centroids in the same int16 unit-ball space as the
// points; dequantize once at load so the renderer reads pure floats.
function dequantizeClusters(map: ClusterMap): ClusterData {
  return {
    assignment: map.cluster_per_point,
    centroids: map.clusters.map((c) => ({
      id: c.id,
      label: c.label,
      xyz: [c.centroid[0] * INT16_TO_UNIT,
            c.centroid[1] * INT16_TO_UNIT,
            c.centroid[2] * INT16_TO_UNIT],
    })),
  };
}
