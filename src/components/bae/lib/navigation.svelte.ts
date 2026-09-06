export const base = '/bae'

// Query changes stay inside the Atlas island; other pages use native navigation.
let search = $state(typeof window === 'undefined' ? '' : window.location.search)

export const route = {
  get url(): URL {
    const url = new URL(typeof window === 'undefined' ? 'http://localhost/' : window.location.href)
    url.search = search
    return url
  },
  get compositeId(): string | null {
    return new URLSearchParams(search).get('composite')
  },
}

if (typeof window !== 'undefined') {
  const syncLocation = () => {
    search = window.location.search
  }
  window.addEventListener('popstate', syncLocation)
  window.addEventListener('pageshow', syncLocation)
}

export function goto(
  target: string | URL,
  { replaceState = false }: { replaceState?: boolean } = {},
): void {
  const url = new URL(target, window.location.href)
  if (
    url.origin !== window.location.origin ||
    (url.pathname !== base && url.pathname !== `${base}/`)
  ) {
    window.location.href = url.href
    return
  }
  if (url.href !== window.location.href) {
    if (replaceState) history.replaceState(history.state, '', url)
    else history.pushState(history.state, '', url)
  }
  search = url.search
}
