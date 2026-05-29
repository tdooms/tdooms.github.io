// Frontend-owned schemas for the dashboard's static dataset. The producer
// (``src/bae/analysis/atlas.py``) is dumb; this file is the contract for the
// JSON sidecars. Every route loader parses through one of the schemas below
// — type drift from Python writers surfaces as a Zod error, not as the wrong
// value rendered in the UI. Types are inferred (``z.infer``).
//
// Arrow tabular files (``index.feather``, ``latent_NNNNN.feather``) are not
// listed here. They self-describe via Arrow's own schema; the route loaders'
// typed field accesses (``cols.density[i]``, ``cols.umap_x[i]``) are the
// implicit column contract — drift surfaces as a ``TypeError`` at first
// access (caught by Playwright + the contract test).
import { z } from "zod";

// --- JSON sidecars --------------------------------------------------------
export const IndexMeta = z.object({
  model_name: z.string(),
  autoencoder: z.string(),
  n_latents: z.number().int().nonnegative(),
});
export type IndexMeta = z.infer<typeof IndexMeta>;

export const Vocab = z.record(z.string(), z.string());                   // token_id (as string) → decoded
export type Vocab = z.infer<typeof Vocab>;

export const CuratedLabels = z.object({
  labels: z.record(z.string(), z.string()),                              // id (as string) → label
});
export type CuratedLabels = z.infer<typeof CuratedLabels>;

export const ClusteredIds = z.array(z.number().int().nonnegative());
export type ClusteredIds = z.infer<typeof ClusteredIds>;

// Per-latent meta (``latent_NNNNN.json``). Written by ``manifold.write_per_latent``;
// frontend ignores ``h_scale`` so we don't declare it.
export const LatentMeta = z.object({
  latent_id: z.number().int().nonnegative(),
  eigvals: z.array(z.number()),
  origin: z.tuple([z.number(), z.number(), z.number()]),
  histogram: z.object({
    counts: z.array(z.number()),
    edges:  z.array(z.number()),
  }),
  neighbours: z.array(z.tuple([z.number(), z.number()])),                // [(otherId, cosine), ...]
});
export type LatentMeta = z.infer<typeof LatentMeta>;

// Per-latent cluster annotation (``latent_NNNNN.cluster.json``). Written by
// ``cli/cluster.py``. ``cluster_per_point`` is a plain JS array — TypedArray
// conversion happens at consumption time in ``dequantizeClusters``.
export const LatentClusters = z.object({
  latent_id: z.number().int().nonnegative(),
  cluster_per_point: z.array(z.number().int()),
  clusters: z.array(z.object({
    id: z.number().int(),
    label: z.string(),
    centroid: z.tuple([z.number(), z.number(), z.number()]),
  })),
});
export type LatentClusters = z.infer<typeof LatentClusters>;

