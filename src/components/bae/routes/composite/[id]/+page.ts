import { dataUrl, fetchJson, fetchBuffer, padId } from "$lib/data";
import { parseIPC } from "$lib/arrow";
import { dequantize } from "$lib/manifold";
import type { Meta } from "$lib/types";

// Dynamic route — served via the SPA fallback shell, no prerender.
export const prerender = false;

export const load = async ({ params, parent, fetch }) => {
  const id = padId(parseInt(params.id, 10));
  const { vocab } = await parent();
  // ``cluster.json`` is optional — only present after ``uv run cluster <id>``.
  // Frontend treats ``null`` as "no clusters available, hide the toggle".
  const [meta, feather, clusterMap] = await Promise.all([
    fetchJson<Meta>(fetch, dataUrl(`latent_${id}.json`)),
    fetchBuffer(fetch, dataUrl(`latent_${id}.feather`)).then((b) => parseIPC<{
      x: Int16Array; y: Int16Array; z: Int16Array;
      h: Int8Array;
      context: Int32Array;
    }>(b)),
    fetchJson<{
      cluster_per_point: Int32Array;
      clusters: { id: number; label: string; centroid: [number, number, number] }[];
    }>(fetch, dataUrl(`latent_${id}.cluster.json`)).catch(() => null),
  ]);
  return { id, meta, points: dequantize(feather, meta, vocab, clusterMap) };
};
