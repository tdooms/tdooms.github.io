<script lang="ts">
  import { MediaQuery } from 'svelte/reactivity'
  import { route } from '$lib/navigation.svelte'
  import { NAME_DISPLAY } from '$lib/manifest'
  import Overview from '$lib/components/Overview.svelte'
  import CompositeList from '$lib/components/CompositeList.svelte'
  import StatTip from '$lib/components/StatTip.svelte'
  import PanelPicker from '$lib/components/PanelPicker.svelte'

  import type { AtlasIndex } from '$lib/types'

  let { data }: { data: AtlasIndex } = $props()
  let composites = $derived(data.index.composites)
  let labelOf = $derived(data.curated.labels)

  // Each sidebar row carries the latent's Hoyer density alongside its label —
  // 0 = highly selective, 1 = uniform firing. Same column slot the neighbours
  // sidebar uses for cosine similarity, so the two views read the same way.
  const withDensity = (id: number, label: string) => ({
    id,
    label,
    value: data.index.byId.get(id)?.density,
  })

  // Search query lives in the URL (?q=…), set by the navbar input. Empty → the
  // top-20 clustered latents by importance (those with a ``cluster.json`` —
  // deep autointerp work). Any text → live substring filter, capped at 200 so
  // the DOM stays small.
  let query = $derived(route.url.searchParams.get('q') ?? '')
  const wide = new MediaQuery('(min-width: 768px)')
  let panel = $state('overview-plot')
  $effect(() => {
    if (query.trim()) panel = 'overview-results'
  })
  let sidebar = $derived.by(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return data.clustered
        .filter((id) => labelOf[id])
        .sort(
          (a, b) =>
            (data.index.byId.get(b)?.importance ?? 0) - (data.index.byId.get(a)?.importance ?? 0),
        )
        .slice(0, 20)
        .map((id) => withDensity(id, labelOf[id]!))
    }
    const matches = []
    for (const [id, label] of Object.entries(labelOf)) {
      if (label.toLowerCase().includes(q)) {
        matches.push(withDensity(+id, label))
        if (matches.length >= 200) break
      }
    }
    return matches
  })
  const resultTitle = $derived(
    query.trim()
      ? `${sidebar.length}${sidebar.length >= 200 ? '+' : ''} ${sidebar.length === 1 ? 'match' : 'matches'}`
      : 'Curated latents',
  )
</script>

<svelte:head><title>bae · {NAME_DISPLAY} · overview</title></svelte:head>

{#snippet densityTip()}
  <StatTip label="density" value="Hoyer">
    Hoyer density of the firing values. 0 means a highly selective latent that fires on a sparse
    subset of tokens; 1 means it fires fairly uniformly. Picks are filtered to those with a
    ``cluster.json`` (deep autointerp work).
  </StatTip>
{/snippet}

<div class="flex h-full min-h-0 flex-col">
  <!-- Keep the live region mounted even while a phone shows the plot. -->
  <p role="status" class="sr-only">{query.trim() ? resultTitle : ''}</p>
  <div class="md:hidden">
    <PanelPicker
      panels={[
        { id: 'overview-plot', label: 'Plot' },
        { id: 'overview-results', label: 'Results' },
      ]}
      bind:value={panel}
    />
  </div>
  <div
    class="divide-base-200 grid min-h-0 flex-1 grid-cols-1 grid-rows-1 md:grid-cols-[1fr_20rem] md:divide-x"
  >
    <section
      id="overview-plot"
      aria-label="Overview plot"
      class="min-h-0 flex-col p-4 md:p-6 {wide.current || panel === 'overview-plot'
        ? 'flex'
        : 'hidden'}"
    >
      {#if wide.current || panel === 'overview-plot'}
        <Overview {composites} {labelOf} />
      {/if}
    </section>
    <div
      id="overview-results"
      class="min-h-0 flex-col {wide.current || panel === 'overview-results' ? 'flex' : 'hidden'}"
    >
      {#if wide.current || panel === 'overview-results'}
        <CompositeList
          items={sidebar}
          title={resultTitle}
          valueLabel="density"
          valueTip={densityTip}
        />
      {/if}
    </div>
  </div>
</div>
