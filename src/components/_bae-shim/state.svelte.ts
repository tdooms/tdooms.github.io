// Reactive state for the bae explorer's SvelteKit-shim layer. Lives in a
// `.svelte.ts` file so $state/$derived can be used at module scope.

class PageState {
  search = $state<string>(typeof window === 'undefined' ? '' : window.location.search)
  // Default to an empty object so components that destructure ``page.data``
  // (e.g. ``const { meta, index } = page.data`` in InfoBar) don't throw on
  // first render — before the orchestrator has had a chance to push real
  // data. Their existing ``if (!meta) ...`` guards then fire normally.
  data = $state<Record<string, unknown>>({})

  get params(): URLSearchParams {
    return new URLSearchParams(this.search)
  }
}

export const pageState = new PageState()

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    pageState.search = window.location.search
  })
}

// Push or replace one or more query params. Pass null to remove a param.
// Mirrors the URL state immediately so $derived reactives re-evaluate without
// waiting for the browser's popstate round-trip.
export function navigate(
  updates: Record<string, string | null>,
  { replace = false }: { replace?: boolean } = {},
): void {
  const sp = new URLSearchParams(window.location.search)
  for (const [k, v] of Object.entries(updates)) {
    if (v === null) sp.delete(k)
    else sp.set(k, v)
  }
  const qs = sp.toString()
  const url = qs ? `?${qs}` : window.location.pathname
  if (replace) history.replaceState({}, '', url)
  else history.pushState({}, '', url)
  pageState.search = qs ? `?${qs}` : ''
}
