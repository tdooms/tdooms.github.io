import { fetchJson, fetchBuffer, experimentUrl } from "$lib/data";
import { parseIPC } from "$lib/arrow";
import { dequantize } from "$lib/manifold";
import type { Meta, PointsData } from "$lib/types";

interface Item {
  seed: number;
  label: string;
  feather: string;
  json: string;
}

export interface Manifest {
  kind: "small-multiples";
  title: string;
  subtitle?: string;
  ae: { base: string; name: string };
  latent_id: number;
  items: Item[];
}

export const prerender = false;

export const load = async ({ params, fetch }) => {
  const slug = params.slug;
  const url = (path: string) => experimentUrl(slug, path);
  const manifest = await fetchJson<Manifest>(fetch, url("manifest.json"));
  const vocab = await fetchJson<Record<string, string>>(fetch, url("vocab.json"));

  const points: PointsData[] = await Promise.all(
    manifest.items.map(async (it) => {
      const [meta, feather] = await Promise.all([
        fetchJson<Meta>(fetch, url(it.json)),
        fetchBuffer(fetch, url(it.feather)).then((b) => parseIPC<{
          x: Int16Array; y: Int16Array; z: Int16Array;
          h: Int8Array;
          context: Int32Array;
        }>(b)),
      ]);
      return dequantize(feather, meta, vocab, null);
    }),
  );

  return { slug, manifest, points };
};
