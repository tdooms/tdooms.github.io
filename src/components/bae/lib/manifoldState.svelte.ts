// Shared toggle state for the manifold scene — the three booleans the user
// can flip from the bottom-bar buttons in ``composite/+layout.svelte``. Lives
// at module scope so any component (the layout's button row, the per-composite
// Spectrum chart that mirrors X/Y/Z labels onto axes-visible bars, the
// Manifold component itself) can read or write it without parent-child
// plumbing or Svelte context.
//
// URL flags initialize the view; later toggles remain in memory. The layout
// stops rotation when reduced motion is requested, allowing an explicit restart.

const url = typeof window === 'undefined' ? null : new URL(window.location.href)
const flag = (key: string) => url?.searchParams.get(key) === '1'

class ManifoldState {
  axesVisible = $state(flag('axes'))
  clusterMode = $state(flag('clusters'))
  autoRotate = $state(flag('rotate'))
}

export const manifoldState = new ManifoldState()
