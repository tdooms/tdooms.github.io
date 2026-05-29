// SvelteKit `$app/state` + `$app/paths` + `$app/navigation` API surface
// re-exposed on top of our query-params router. Vite + tsconfig aliases route
// SvelteKit imports to this module, so the bae frontend files compile
// unchanged.

import { pageState, navigate } from './state.svelte'

// The explorer's static path. All path-based URLs the bae frontend constructs
// (`${base}/composite/123`) get caught by `goto` and rewritten into
// `?composite=123` so the URL stays under /research/bae/explorer/.
export const base = '/bae'

// SvelteKit's `page` object. We expose just the bits the bae components use:
// url (always the current window URL), params (id mapped from ?composite=),
// and data (the merged load() result, kept in sync by Explorer.svelte before
// rendering the active route).
export const page = {
  get url(): URL {
    return new URL(typeof window === 'undefined' ? 'http://localhost/' : window.location.href)
  },
  get params(): { id?: string } {
    return { id: pageState.params.get('composite') ?? undefined }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get data(): any {
    return pageState.data
  },
}

// Setter for Explorer to push the merged load() data into page.data before
// rendering. Not exposed via the $app shims — only the orchestrator uses it.
export function setPageData(data: Record<string, unknown>): void {
  pageState.data = data
}

// SvelteKit `goto`. Rewrites path-style targets into query-param navigations.
export function goto(
  target: string | URL,
  {
    replaceState = false,
  }: { replaceState?: boolean; keepFocus?: boolean; noScroll?: boolean } = {},
): void {
  const url =
    typeof target === 'string' ? new URL(target, window.location.origin) : new URL(target.href)

  const composite = /\/composite\/(\d+)/.exec(url.pathname)
  if (composite?.[1]) {
    navigate({ composite: composite[1], experiment: null }, { replace: replaceState })
    return
  }

  const exp = /\/experiments\/([^/]+)/.exec(url.pathname)
  if (exp?.[1]) {
    navigate({ experiment: exp[1], composite: null }, { replace: replaceState })
    return
  }

  if (url.pathname === base || url.pathname === `${base}/` || url.pathname === '/') {
    const q = url.searchParams.get('q')
    navigate({ composite: null, experiment: null, q: q ?? null }, { replace: replaceState })
    return
  }

  window.location.href = url.href
}
