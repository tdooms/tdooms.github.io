<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { AtlasData } from '$lib/types'
  import InfoBar from '$lib/components/InfoBar.svelte'
  import { route } from '$lib/navigation.svelte'

  let { children, data }: { children: Snippet; data: AtlasData | null } = $props()
  let heading: HTMLHeadingElement
  let previousComposite = route.compositeId
  let pendingFocus = false
  const description = $derived(
    data?.meta
      ? `Composite ${data.meta.latent_id}: ${data.curated.labels[data.meta.latent_id] ?? 'no description'}`
      : 'Overview',
  )

  $effect(() => {
    const selected = route.compositeId
    if (selected !== previousComposite) {
      previousComposite = selected
      pendingFocus = true
    }
    const ready = !selected || data?.meta?.latent_id === Number(selected)
    if (!pendingFocus || !ready) return
    // Native page navigation resets the reading position. Atlas replaces only
    // its view, so restore that position once the selected data has arrived.
    // Typing while a request is in flight must keep the search field focused.
    // Back may restore native fragment focus after the popstate microtasks.
    const frame = requestAnimationFrame(() => {
      pendingFocus = false
      const focused = document.activeElement
      if (
        focused instanceof HTMLElement &&
        (focused.matches('input, textarea, select') || focused.isContentEditable)
      )
        return
      heading.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  })
</script>

<a
  href="#main-content"
  class="focus:bg-primary focus:text-primary-content sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:px-4 focus:py-2"
  >Skip to content</a
>
<InfoBar {data} />
<main id="main-content" class="min-h-0 flex-1">
  <h1 bind:this={heading} tabindex="-1" aria-describedby="atlas-selection" class="sr-only">
    Atlas
  </h1>
  <span id="atlas-selection" hidden>{description}</span>
  {@render children()}
</main>
