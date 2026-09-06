<script lang="ts">
  // Loads the Atlas index and selected composite; child views receive typed data.
  import { getAbortSignal, type Component } from 'svelte'
  import { dataUrl, fetchJson, fetchOptionalJson, fetchBuffer, padId } from '$lib/data'
  import { parseIPC } from '$lib/arrow'
  import { dequantize } from '$lib/manifold'
  import type { AtlasIndex, AtlasComposite, Composite, Meta } from '$lib/types'
  import { base, goto, route } from '$lib/navigation.svelte'

  import RootLayout from './bae/routes/+layout.svelte'
  import Overview from './bae/routes/+page.svelte'

  interface IndexColumns {
    latent_id: Uint32Array
    density: Float32Array
    eff_rank: Float32Array
    importance: Float32Array
    support: Uint16Array
    umap_x: Float32Array
    umap_y: Float32Array
  }

  let layoutData = $state<AtlasIndex | null>(null)
  let layoutError = $state<string | null>(null)
  let compositeData = $state<AtlasComposite | null>(null)
  let compositeError = $state<string | null>(null)
  let CompositeView = $state<Component<{ data: AtlasIndex & AtlasComposite }> | null>(null)
  // Context text is needed only by composite views; reuse it after the first load.
  let vocab: Record<string, string> | undefined

  let activeComposite = $derived(route.compositeId)

  // Load the shared index once on mount.
  $effect(() => {
    const signal = getAbortSignal()
    const request: typeof fetch = (url, options) => fetch(url, { ...options, signal })
    void (async () => {
      try {
        const [idxBuf, curated, clustered] = await Promise.all([
          fetchBuffer(request, dataUrl('index.feather')),
          fetchJson<{ labels: Record<number, string> }>(request, dataUrl('curated.json')),
          fetchJson<number[]>(request, dataUrl('clusters.json')),
        ])
        const cols = parseIPC<IndexColumns>(idxBuf)
        const count = cols.latent_id?.length
        if (!count) throw new Error('Atlas index contains no composites')
        const names = [
          'latent_id',
          'density',
          'eff_rank',
          'importance',
          'support',
          'umap_x',
          'umap_y',
        ] as const
        for (const name of names) {
          const column = cols[name]
          if (!column || column.length !== count || !column.every(Number.isFinite)) {
            throw new Error(`Invalid index column: ${name}`)
          }
        }
        if (
          !cols.latent_id.every((id) => Number.isSafeInteger(id) && id >= 0) ||
          new Set(cols.latent_id).size !== count
        ) {
          throw new Error('Index composite IDs must be unique nonnegative integers')
        }
        const composites: Composite[] = Array.from(cols.latent_id, (id, i) => ({
          id: Number(id),
          density: cols.density[i]!,
          rank: cols.eff_rank[i]!,
          importance: cols.importance[i]!,
          support: cols.support[i]!,
          umap: [cols.umap_x[i]!, cols.umap_y[i]!],
        }))
        const byId = new Map<number, Composite>(composites.map((c) => [c.id, c]))
        layoutData = {
          curated,
          clustered,
          index: {
            composites,
            byId,
          },
        }
      } catch (err) {
        if (!signal.aborted) layoutError = err instanceof Error ? err.message : String(err)
      }
    })()
  })

  // Load the selected composite when its ID changes.
  $effect(() => {
    const cid = activeComposite
    const ld = layoutData
    if (!cid || !ld) {
      compositeData = null
      compositeError = null
      return
    }
    compositeData = null
    compositeError = null
    const id = Number(cid)
    if (!/^\d+$/.test(cid) || !Number.isSafeInteger(id) || !ld.index.byId.has(id)) {
      compositeError = 'Unknown composite ID'
      return
    }
    const padded = padId(id)
    const signal = getAbortSignal()
    const request: typeof fetch = (url, options) => fetch(url, { ...options, signal })
    void (async () => {
      try {
        const [view, tokens, meta, feather, clusterMap] = await Promise.all([
          import('./bae/routes/composite/+layout.svelte'),
          vocab ?? fetchJson<Record<string, string>>(request, dataUrl('vocab.json')),
          fetchJson<Meta>(request, dataUrl(`latent_${padded}.json`)),
          fetchBuffer(request, dataUrl(`latent_${padded}.feather`)).then((b) =>
            parseIPC<{
              x: Int16Array
              y: Int16Array
              z: Int16Array
              h: Int8Array
              context: Uint32Array
            }>(b),
          ),
          fetchOptionalJson<{
            cluster_per_point: number[]
            clusters: { id: number; label: string; centroid: [number, number, number] }[]
          }>(request, dataUrl(`latent_${padded}.cluster.json`)),
        ])
        if (signal.aborted) return
        if (meta.latent_id !== id)
          throw new Error(`Expected composite ${id}, received ${meta.latent_id}`)
        const points = dequantize(feather, meta, tokens, clusterMap)
        vocab = tokens
        CompositeView = view.default
        compositeData = {
          id: padded,
          meta,
          points,
        }
      } catch (err) {
        if (signal.aborted) return
        compositeError = err instanceof Error ? err.message : String(err)
      }
    })()
  })

  const merged = $derived(layoutData && compositeData ? { ...layoutData, ...compositeData } : null)

  // Atlas anchors use real query-param URLs so new tabs and copied links work.
  // Ordinary clicks update the selected view without remounting the island.
  $effect(() => {
    const onClick = (e: MouseEvent): void => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // let new-tab pass
      const link = e.target instanceof Element ? e.target.closest('a') : null
      if (!link) return
      const href = link.getAttribute('href')
      if (!href) return
      if (link.target && link.target !== '_self') return
      if (link.hasAttribute('download')) return
      const url = new URL(href, window.location.href)
      if (url.origin !== window.location.origin || url.hash) return
      if (url.pathname !== base && url.pathname !== `${base}/`) return
      e.preventDefault()
      goto(url)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  })
</script>

<!-- Chrome always renders (RootLayout = top nav + search). Data regions inside
     the slot either render content or render a content-shaped skeleton; we
     never paint a "Loading…" overlay over the chrome. -->
<RootLayout data={merged ?? layoutData}>
  {#snippet children()}
    {#if layoutError}
      <div class="p-6">
        <div class="alert alert-error" role="alert">Failed to load atlas data: {layoutError}</div>
      </div>
    {:else if activeComposite}
      {#if compositeError}
        <div class="p-6">
          <div class="alert alert-error" role="alert">
            Failed to load composite {activeComposite}: {compositeError}
          </div>
        </div>
      {:else if !layoutData || !compositeData || !merged || !CompositeView}
        <span class="sr-only" role="status">Loading composite</span>
        <div
          class="divide-base-200 grid h-full grid-cols-[1fr] grid-rows-1 divide-x xl:grid-cols-[24rem_1fr_20rem]"
          aria-busy="true"
        >
          <aside class="hidden min-h-0 flex-col gap-4 p-6 xl:flex">
            <div class="skeleton h-6 w-2/3"></div>
            <div class="skeleton h-24"></div>
            <div class="skeleton h-40"></div>
            <div class="skeleton h-32"></div>
          </aside>
          <section class="bg-base-100 relative">
            <div class="skeleton absolute inset-3"></div>
          </section>
          <aside class="hidden min-h-0 flex-col gap-2 p-4 xl:flex">
            {#each Array(10) as _, i (i)}
              <div class="skeleton h-8"></div>
            {/each}
          </aside>
        </div>
      {:else}
        <CompositeView data={merged} />
      {/if}
    {:else if !layoutData}
      <span class="sr-only" role="status">Loading Atlas</span>
      <div
        class="divide-base-200 grid h-full grid-cols-[1fr] grid-rows-1 divide-x md:grid-cols-[1fr_20rem]"
        aria-busy="true"
      >
        <section class="flex min-h-0 flex-col gap-4 p-6">
          <div class="skeleton flex-1"></div>
        </section>
        <aside class="hidden min-h-0 flex-col gap-2 overflow-hidden p-4 md:flex">
          {#each Array(12) as _, i (i)}
            <div class="skeleton h-8"></div>
          {/each}
        </aside>
      </div>
    {:else}
      <Overview data={layoutData} />
    {/if}
  {/snippet}
</RootLayout>
