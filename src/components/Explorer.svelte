<script lang="ts">
  // Top-level orchestrator for the bae explorer. Owns:
  //   * layout data load (replicates bae's routes/+layout.ts)
  //   * per-composite data load (replicates routes/composite/[id]/+page.ts)
  //   * route switch (?composite= → composite view, else → overview)
  //   * pushing the merged data into page.data via the shim so SvelteKit-style
  //     `import { page } from "$app/state"` reads keep working
  // The bae routes/* and lib/* trees are byte-identical to the bae frontend
  // repo; this file is the only adapter that knows we live on top of Astro.

  import { dataUrl, fetchJson, fetchBuffer, padId } from '$lib/data'
  import { parseIPC } from '$lib/arrow'
  import { dequantize } from '$lib/manifold'
  import type { Composite, Meta, PointsData } from '$lib/types'
  import { base, goto, setPageData } from './_bae-shim/nav'
  import { pageState } from './_bae-shim/state.svelte'

  import RootLayout from './bae/routes/+layout.svelte'
  import Overview from './bae/routes/+page.svelte'
  import CompositeLayout from './bae/routes/composite/+layout.svelte'
  import CompositePage from './bae/routes/composite/[id]/+page.svelte'

  interface IndexColumns {
    latent_id: Uint32Array
    density: Float32Array
    eff_rank: Float32Array
    importance: Float32Array
    support: Uint16Array
    umap_x: Float32Array
    umap_y: Float32Array
  }

  interface LayoutData {
    vocab: Record<string, string>
    curated: { labels: Record<number, string> }
    clustered: number[]
    index: {
      model_name: string
      autoencoder: string
      composites: Composite[]
      byId: Map<number, Composite>
    }
  }

  interface CompositeData {
    id: string
    meta: Meta
    points: PointsData
  }

  let layoutData = $state<LayoutData | null>(null)
  let layoutError = $state<string | null>(null)
  let compositeData = $state<CompositeData | null>(null)
  let compositeError = $state<string | null>(null)

  let activeComposite = $derived(pageState.params.get('composite'))

  // Layout-data load: one-shot on mount. Mirrors bae routes/+layout.ts.
  $effect(() => {
    void (async () => {
      try {
        const [meta, idxBuf, vocab, curated, clustered] = await Promise.all([
          fetchJson<{ model_name: string; autoencoder: string; n_latents: number }>(
            globalThis.fetch,
            dataUrl('index.json'),
          ),
          fetchBuffer(globalThis.fetch, dataUrl('index.feather')),
          fetchJson<Record<string, string>>(globalThis.fetch, dataUrl('vocab.json')),
          fetchJson<{ labels: Record<number, string> }>(globalThis.fetch, dataUrl('curated.json')),
          fetchJson<number[]>(globalThis.fetch, dataUrl('clusters.json')).catch(
            () => [] as number[],
          ),
        ])
        const cols = parseIPC<IndexColumns>(idxBuf)
        const composites: Composite[] = Array.from(cols.latent_id, (id, i) => ({
          id: Number(id),
          density: cols.density[i] ?? 0,
          rank: cols.eff_rank[i] ?? 0,
          importance: cols.importance[i] ?? 0,
          support: cols.support[i] ?? 0,
          umap: [cols.umap_x[i] ?? 0, cols.umap_y[i] ?? 0],
        }))
        const byId = new Map<number, Composite>(composites.map((c) => [c.id, c]))
        layoutData = {
          vocab,
          curated,
          clustered,
          index: {
            model_name: meta.model_name,
            autoencoder: meta.autoencoder,
            composites,
            byId,
          },
        }
      } catch (err) {
        layoutError = err instanceof Error ? err.message : String(err)
      }
    })()
  })

  // Composite-data load: re-runs on activeComposite change. Mirrors bae
  // routes/composite/[id]/+page.ts.
  $effect(() => {
    const cid = activeComposite
    const ld = layoutData
    if (!cid || !ld) {
      compositeData = null
      compositeError = null
      return
    }
    const padded = padId(parseInt(cid, 10))
    compositeData = null
    compositeError = null
    let cancelled = false
    void (async () => {
      try {
        const [meta, feather, clusterMap] = await Promise.all([
          fetchJson<Meta>(globalThis.fetch, dataUrl(`latent_${padded}.json`)),
          fetchBuffer(globalThis.fetch, dataUrl(`latent_${padded}.feather`)).then((b) =>
            parseIPC<{
              x: Int16Array
              y: Int16Array
              z: Int16Array
              h: Int8Array
              context: Int32Array
            }>(b),
          ),
          fetchJson<{
            cluster_per_point: Int32Array
            clusters: { id: number; label: string; centroid: [number, number, number] }[]
          }>(globalThis.fetch, dataUrl(`latent_${padded}.cluster.json`)).catch(() => null),
        ])
        if (cancelled) return
        compositeData = {
          id: padded,
          meta,
          points: dequantize(feather, meta, ld.vocab, clusterMap),
        }
      } catch (err) {
        if (cancelled) return
        compositeError = err instanceof Error ? err.message : String(err)
      }
    })()
    return () => {
      cancelled = true
    }
  })

  // Merged page.data, mirrors SvelteKit's layout+page data merge. Components
  // that read page.data via the $app/state shim see this object.
  let merged = $derived.by<LayoutData | (LayoutData & CompositeData) | null>(() => {
    if (!layoutData) return null
    if (compositeData) return { ...layoutData, ...compositeData }
    return layoutData
  })

  // `$effect.pre` runs before the DOM update and before child effects, so
  // `page.data` is current the first time InfoBar / CompositeLayout read it.
  // A plain `$effect` would flush after children, racing the destructure
  // `const { meta, index } = page.data` and crashing on first paint.
  $effect.pre(() => {
    if (merged) setPageData(merged)
  })

  // SvelteKit-style click delegation. The bae verbatim components render
  // `<a href="${base}/composite/N">` (e.g. CompositeList sidebar items)
  // expecting SvelteKit to intercept the click and route via its router.
  // Without SvelteKit, the browser does a real navigation and 404s — the
  // explorer is a single Astro page that uses query-params, not nested
  // routes. Catch in-app clicks at the document level (capture phase, so we
  // run before Astro's `<ClientRouter />` prefetch / view-transition handler
  // gets a turn) and forward to `goto()`.
  $effect(() => {
    const onClick = (e: MouseEvent): void => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // let new-tab pass
      const target = e.target as HTMLElement | null
      const link = target?.closest('a')
      if (!link) return
      const href = link.getAttribute('href')
      if (!href) return
      if (link.target && link.target !== '_self') return
      if (link.hasAttribute('download')) return
      if (/^(https?:)?\/\//.test(href)) return // external
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      const url = new URL(href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (!url.pathname.startsWith(base)) return // links escaping the explorer
      e.preventDefault()
      e.stopImmediatePropagation()
      goto(url)
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  })
</script>

<!-- Chrome always renders (RootLayout = top nav + search). Data regions inside
     the slot either render content or render a content-shaped skeleton; we
     never paint a "Loading…" overlay over the chrome. -->
<RootLayout>
  {#snippet children()}
    {#if layoutError}
      <div class="p-6">
        <div class="alert alert-error">Failed to load atlas data: {layoutError}</div>
      </div>
    {:else if activeComposite}
      {#if compositeError}
        <div class="p-6">
          <div class="alert alert-error">
            Failed to load composite {activeComposite}: {compositeError}
          </div>
        </div>
      {:else if !layoutData || !compositeData || !merged}
        <!-- Composite-shaped skeleton: same three-track grid as
             `composite/+layout.svelte` (24rem detail | 1fr manifold | 20rem
             neighbours), so the WebGL canvas mounts into a stable rectangle
             and the page is byte-stable when data lands. Shown whether we're
             waiting on layoutData, compositeData, or both — the user landed
             on a composite URL, so the composite shape is what to skeleton. -->
        <div
          class="divide-base-200 grid h-full grid-cols-[1fr] grid-rows-1 divide-x md:grid-cols-[24rem_1fr] xl:grid-cols-[24rem_1fr_20rem]"
          aria-busy="true"
        >
          <aside class="hidden min-h-0 flex-col gap-4 p-6 md:flex">
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
        <CompositeLayout data={merged}>
          {#snippet children()}
            <CompositePage data={merged} />
          {/snippet}
        </CompositeLayout>
      {/if}
    {:else if !layoutData}
      <!-- Overview-shaped skeleton: main panel (UMAP scatter) + 20rem sidebar.
           Animated grey blocks that occupy the same grid as the real Overview,
           so the page is byte-stable when data lands. -->
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
