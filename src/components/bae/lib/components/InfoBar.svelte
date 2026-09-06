<script lang="ts">
  import { base, goto, route } from '$lib/navigation.svelte'
  import { AE_CONFIG, BASE, BASE_DISPLAY, MODEL, NAME_DISPLAY } from '$lib/manifest'
  import { compact } from '$lib/format'
  import CompositeStats from '$lib/components/CompositeStats.svelte'
  import type { AtlasData } from '$lib/types'
  import ConfigGrid from '$lib/components/ConfigGrid.svelte'
  import HoverCard from '$lib/components/HoverCard.svelte'
  import HoverHeader from '$lib/components/HoverHeader.svelte'
  import StatTip from '$lib/components/StatTip.svelte'
  // Shared site navigation glyphs.
  import Icon from '@/components/Icon.svelte'

  let { data }: { data: AtlasData | null } = $props()

  // Two breadcrumb hovers, divided by concern:
  //   * model — what we're hooking *into* (HF facts: depth, width, vocab, ctx)
  //   * AE    — what was trained on top (kind / latent count / hoyer)
  const modelEntries: [string, string | number][] = [
    ['layers', MODEL.layers],
    ['d_model', MODEL.d_model],
    ['vocab', compact(MODEL.vocab)],
    ['ctx', compact(MODEL.ctx)],
  ]
  const aeEntries: [string, string | number][] = [
    ['kind', AE_CONFIG.kind],
    ['hook', `${AE_CONFIG.hook} · layer ${AE_CONFIG.layer}`],
    ['latents', AE_CONFIG.d_latent],
    ['hoyer', AE_CONFIG.hoyer],
  ]

  // Search lives in the URL (?q=…) so it survives navigation and back/forward.
  // The landing page reads the same param to filter its sidebar; on
  // a composite typing updates the local URL and Enter opens the overview.
  let query = $derived(route.url.searchParams.get('q') ?? '')
  const overviewHref = $derived(query ? `${base}/?q=${encodeURIComponent(query)}` : `${base}/`)
  let inputEl = $state<HTMLInputElement>()
  let themeInput = $state<HTMLInputElement>()

  // The client-only navbar mounts after Layout's initial theme restoration.
  $effect(() => {
    if (themeInput) themeInput.checked = document.documentElement.dataset.theme === 'dark'
  })

  const setQuery = (v: string) => {
    const url = route.url
    if (v) url.searchParams.set('q', v)
    else url.searchParams.delete('q')
    goto(url, { replaceState: true })
  }

  const onInput = (e: Event) => setQuery((e.currentTarget as HTMLInputElement).value)
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && route.compositeId) {
      goto(overviewHref)
    } else if (e.key === 'Escape') {
      setQuery('')
      inputEl?.blur()
    }
  }

  // Keep the search input and its shortcuts in one component.
  $effect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputEl?.focus()
        inputEl?.select()
      }
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  })
</script>

<!-- Keep the home link, active ID and search available on phones. Add the
     full breadcrumb and statistics only when their groups fit beside search. -->
<header
  class="border-base-200 bg-base-100 flex h-14 items-center justify-between gap-4 border-b pr-0 pl-3"
>
  <nav aria-label="breadcrumb" class="flex shrink-0 items-center gap-3">
    <div class="flex items-center">
      <a href="/" class="btn btn-ghost btn-square btn-sm text-base-content/65" aria-label="Home">
        <Icon name="house" class="h-4 w-4" />
      </a>
      {#if route.compositeId}
        <a
          href={overviewHref}
          class="btn btn-ghost btn-square btn-sm text-base-content/65"
          aria-label={query.trim() ? 'Back to results' : 'Atlas overview'}
          title={query.trim() ? 'Back to results' : 'Atlas overview'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m12 5-7 7 7 7M5 12h14" />
          </svg>
        </a>
      {/if}
    </div>
    <div class="text-base-content/70 flex min-w-0 items-baseline gap-2.5 font-mono text-xs">
      <div class="hidden items-baseline gap-2.5 whitespace-nowrap sm:flex">
        <HoverCard side="bottom" align="start">
          <span>{BASE_DISPLAY}</span>
          {#snippet tip()}
            <HoverHeader label="model" code={BASE} />
            <ConfigGrid entries={modelEntries} />
          {/snippet}
        </HoverCard>
        <span class="text-base-content/20" aria-hidden="true">/</span>
        <HoverCard side="bottom" align="start">
          <span>{NAME_DISPLAY}</span>
          {#snippet tip()}
            <HoverHeader label="autoencoder" code={NAME_DISPLAY} />
            <ConfigGrid entries={aeEntries} />
          {/snippet}
        </HoverCard>
      </div>
      {#if data?.meta}
        {@const compositeId = String(data.meta.latent_id)}
        <span class="text-base-content/20 hidden sm:inline" aria-hidden="true">/</span>
        <HoverCard side="bottom" align="start">
          <span>{compositeId}</span>
          {#snippet tip()}
            <StatTip label="composite" value={compositeId}>
              The active composite. Each composite is a matrix B that combines encoder latents in
              pairs (so the response is quadratic in the input). This page shows B's
              eigendecomposition: which directions the composite responds to most strongly.
            </StatTip>
          {/snippet}
        </HoverCard>
      {/if}
    </div>
  </nav>

  {#if data?.meta}
    <div class="hidden xl:block"><CompositeStats {data} compact /></div>
  {/if}

  <!-- At md and above, this group aligns with the 20rem results sidebar. -->
  <div class="flex w-56 min-w-0 items-center gap-2 pr-3 sm:w-64 md:w-80">
    <label
      class="input bg-base-200 border-base-200 focus-within:bg-base-100 focus-within:border-base-300 flex-1"
    >
      <svg
        class="h-4 w-4 opacity-60"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        bind:this={inputEl}
        value={query}
        oninput={onInput}
        onkeydown={onKey}
        type="search"
        placeholder="search descriptions…"
        aria-label="search composite descriptions"
      />
      <kbd class="kbd kbd-sm hidden lg:inline-flex" aria-hidden="true">⌘/Ctrl K</kbd>
    </label>
    <label
      class="btn btn-ghost btn-square btn-sm swap text-base-content/65 shrink-0"
      aria-label="Toggle dark mode"
    >
      <input bind:this={themeInput} type="checkbox" class="theme-controller" value="dark" />
      <Icon name="sun" class="swap-off h-4 w-4" />
      <Icon name="moon" class="swap-on h-4 w-4" />
    </label>
  </div>
</header>
