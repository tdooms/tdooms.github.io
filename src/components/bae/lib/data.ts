// How to fetch the manifold data. The "where" lives in ``manifest.ts`` (active
// AE); the "how" is here: build URLs under the active AE's data root and hand
// back JSON or raw buffers, surfacing HTTP errors loudly so a 404 doesn't get
// silently re-parsed as JSON.
//
// The ``fetch`` parameter is SvelteKit's enhanced fetch (received in ``load``).
// Passing it (instead of relying on ``globalThis.fetch``) avoids a runtime
// warning + lets SvelteKit reuse SSR-prefetch caches if SSR is ever enabled.
import { base } from "$app/paths";
import { BASE, NAME } from "./manifest";

type Fetch = typeof globalThis.fetch;

const root = `${import.meta.env.VITE_DATA_URL ?? `${base}/data`}/${BASE}/${NAME}`;

export const dataUrl = (path: string): string => `${root}/${path}`;

export const padId = (id: number | string): string =>
  String(id).padStart(5, "0");

const fetchOk = (fetch: Fetch, url: string): Promise<Response> =>
  fetch(url).then((r) =>
    r.ok ? r : Promise.reject(new Error(`${r.status} ${r.statusText} — ${url}`)));

export const fetchJson = <T>(fetch: Fetch, url: string): Promise<T> =>
  fetchOk(fetch, url).then((r) => r.json() as Promise<T>);

export const fetchBuffer = (fetch: Fetch, url: string): Promise<ArrayBuffer> =>
  fetchOk(fetch, url).then((r) => r.arrayBuffer());

// Workspace experiments live alongside the active AE's data root, indexed by a
// top-level ``experiments/index.json``. Dev / preview servers resolve the path
// via the ``frontend/static/data/experiments`` symlink to ``artifacts/paper/experiments``.
const expRoot = `${import.meta.env.VITE_DATA_URL ?? `${base}/data`}/experiments`;
export const experimentUrl = (slug: string, path: string): string => `${expRoot}/${slug}/${path}`;
export const experimentsIndexUrl = (): string => `${expRoot}/index.json`;
