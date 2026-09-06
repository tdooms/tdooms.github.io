// How to fetch the manifold data. The "where" lives in ``manifest.ts`` (active
// AE); the "how" is here: build URLs under the active AE's data root and hand
// back JSON or raw buffers, surfacing HTTP errors loudly so a 404 doesn't get
// silently re-parsed as JSON.
//
// The caller supplies fetch so loading has an explicit network boundary.
import { base } from './navigation.svelte'
import { BASE, NAME } from './manifest'

type Fetch = typeof globalThis.fetch

const root = `${import.meta.env.VITE_DATA_URL ?? `${base}/data`}/${BASE}/${NAME}`

export const dataUrl = (path: string): string => `${root}/${path}`

export const padId = (id: number | string): string => String(id).padStart(5, '0')

const fetchOk = (fetch: Fetch, url: string): Promise<Response> =>
  fetch(url).then((r) =>
    r.ok ? r : Promise.reject(new Error(`${r.status} ${r.statusText} — ${url}`)),
  )

export const fetchJson = <T>(fetch: Fetch, url: string): Promise<T> =>
  fetchOk(fetch, url).then((r) => r.json() as Promise<T>)

// Cluster annotations are optional. Only an absent file is optional; a broken
// request or malformed JSON must reach the page's error state.
export const fetchOptionalJson = async <T>(fetch: Fetch, url: string): Promise<T | null> => {
  const response = await fetch(url)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} — ${url}`)
  return response.json() as Promise<T>
}

export const fetchBuffer = (fetch: Fetch, url: string): Promise<ArrayBuffer> =>
  fetchOk(fetch, url).then((r) => r.arrayBuffer())
