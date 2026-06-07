// Cross-module data shapes. Single home for "what flows through the app".
//
// PointsData ─ rendered by Manifold.svelte; produced by manifold.ts:dequantize
// Composite  ─ one row of the global index; the per-composite metadata
// Meta       ─ per-composite JSON loaded for the /composite/<id> route
// Theme      ─ resolved daisyUI/Tailwind colour tokens

export interface Composite {
  id: number;
  density: number;                                                           // Hoyer density of firing values, [0, 1]
  rank: number;                                                              // effective rank of B = (Σ|λ|)² / Σλ²
  importance: number;                                                        // Σλ², normalised so the population mean is 1
  support: number;                                                           // count of encoder latents the composite reads from
  umap: [number, number];                                                    // 2D UMAP of the top-20 |λ| fingerprint
}

export interface Meta {
  latent_id: number;
  eigvals: number[];                                                         // full spectrum, eigh-ascending order
  origin: [number, number, number];                                          // latent centroid in projected (x, y, z)
  histogram: { counts: number[]; edges: number[] };                          // firing-value distribution
  neighbours: [number, number][];                                            // [(otherId, cosine), ...]
}

export interface ClusterData {
  assignment: Int32Array;                                                    // assignment[i] = cluster id for point i
  centroids: ClusterCentroid[];
}

export interface ClusterCentroid {
  id: number;
  label: string;                                                             // autointerp label, e.g. "negation tokens"
  xyz: [number, number, number];                                             // unit-ball coords
}

export interface PointsData {
  n: number;                                                                 // point count
  xyz: Float32Array;                                                         // length 3n, unit-ball
  activation: Float32Array;                                                  // length n, in [-1, 1] (sign preserved)
  context: Int32Array;                                                       // length n * contextLength; token ids into vocab
  contextLength: number;                                                     // tokens per context window — global, constant
  vocab: Record<string, string>;                                             // tokenId → display string
  origin: [number, number, number];                                          // unit-ball coords of the composite centroid
  eigvals: [number, number, number];                                         // top-3 eigenvalues by |λ|
  clusters: ClusterData | null;                                              // optional autointerp clustering
}

export interface Theme {
  primary: string;
  secondary: string;
  base100: string;
  base200: string;
  base300: string;
  baseContent: string;
  error: string;
  warning: string;
  primarySoft: string;
  muted: string;
  faint: string;
}
