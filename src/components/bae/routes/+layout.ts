import { dataUrl, fetchJson, fetchBuffer } from "$lib/data";
import { parseIPC } from "$lib/arrow";
import type { Composite } from "$lib/types";

// SPA mode: data fetched in the browser. Index + global vocab loaded once on
// boot; per-composite data is fetched in ``composite/[id]/+page.ts``.
export const ssr = false;
export const prerender = true;

// Columnar shape of ``index.feather`` written by ``cli/dashboard.py:sample()``.
interface IndexColumns {
  latent_id: Uint32Array;
  density: Float32Array;
  eff_rank: Float32Array;                                                    // renamed → ``rank`` at the boundary
  importance: Float32Array;
  support: Uint16Array;
  umap_x: Float32Array;
  umap_y: Float32Array;
}

interface IndexJson { model_name: string; autoencoder: string; n_latents: number; }
interface Curated { labels: Record<number, string>; }

export const load = async ({ fetch }) => {
  const [meta, idxBuf, vocab, curated, clustered] = await Promise.all([
    fetchJson<IndexJson>(fetch, dataUrl("index.json")),
    fetchBuffer(fetch, dataUrl("index.feather")),
    fetchJson<Record<string, string>>(fetch, dataUrl("vocab.json")),
    fetchJson<Curated>(fetch, dataUrl("curated.json")),
    // ``clusters.json`` is written by ``cli/cluster.py`` after each run — the list
    // of latents that have a deep autointerp pass. Empty array if no clustering yet.
    fetchJson<number[]>(fetch, dataUrl("clusters.json")).catch(() => [] as number[]),
  ]);

  // Columnar feather → array of ``Composite`` records (one row per latent).
  // Boundary rename: Python's ``eff_rank`` → frontend ``rank`` (the math
  // definition lives in ``InfoBar``'s tooltip, not in the field name).
  const cols = parseIPC<IndexColumns>(idxBuf);
  const composites: Composite[] = Array.from(cols.latent_id, (id, i) => ({
    id:         Number(id),
    density:    cols.density[i],
    rank:       cols.eff_rank[i],
    importance: cols.importance[i],
    support:    cols.support[i],
    umap:       [cols.umap_x[i], cols.umap_y[i]],
  }));
  const byId = new Map<number, Composite>(composites.map((c) => [c.id, c]));

  return {
    vocab,
    curated,
    clustered,
    index: {
      model_name: meta.model_name,
      autoencoder: meta.autoencoder,
      composites,
      byId,
    },
  };
};
