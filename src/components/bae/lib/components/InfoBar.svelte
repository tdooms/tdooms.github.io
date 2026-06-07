<script lang="ts">
  import { base } from "$app/paths";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { AE_CONFIG, BASE, BASE_DISPLAY, MODEL, NAME_DISPLAY } from "$lib/manifest";
  import { compact } from "$lib/format";
  import { compositeStats, captured } from "$lib/stats";
  import { registerSearchFocus } from "$lib/searchFocus";
  import ConfigGrid from "$lib/components/ConfigGrid.svelte";
  import HoverCard from "$lib/components/HoverCard.svelte";
  import HoverHeader from "$lib/components/HoverHeader.svelte";
  import StatTip from "$lib/components/StatTip.svelte";
  // Drift from bae verbatim: shared Icon component so the home + theme
  // glyphs in this navbar are byte-identical to the site Navbar's. Same
  // path data (fa6-solid family), same viewBox, same dimensions.
  import Icon from "@/components/Icon.svelte";

  interface StatRow { label: string; value: string; tex: string; blurb: string; }

  // Two breadcrumb hovers, divided by concern:
  //   * model — what we're hooking *into* (HF facts: depth, width, vocab, ctx)
  //   * AE    — what was trained on top (kind / latent count / hoyer)
  const modelEntries: [string, string | number][] = [
    ["layers",  MODEL.layers],
    ["d_model", MODEL.d_model],
    ["vocab",   compact(MODEL.vocab)],
    ["ctx",     compact(MODEL.ctx)],
  ];
  const aeEntries: [string, string | number][] = [
    ["kind",    AE_CONFIG.kind],
    ["hook",    `${AE_CONFIG.hook} · layer ${AE_CONFIG.layer}`],
    ["latents", AE_CONFIG.d_latent],
    ["hoyer",   AE_CONFIG.hoyer],
  ];

  // Five rows for the per-composite navbar stats. ``meta`` exists only on
  // /composite/[id]; the home page has no per-composite stats. The math
  // lives in ``lib/stats.ts`` so the chrome stays pure rendering.
  let rows = $derived.by<StatRow[] | null>(() => {
    const { meta, index } = page.data;
    if (!meta) return null;
    const composite = index.byId.get(meta.latent_id);
    const s = compositeStats(composite, index.composites.length);
    return [
      { label: "density",
        value: s.density,
        tex: "\\frac{\\|h\\|_1 / \\|h\\|_2 - 1}{\\sqrt{n} - 1}",
        blurb: "Hoyer density of the firing values over the cache. Close to 0 means the composite is highly selective, firing on a small fraction of tokens. Close to 1 means it fires fairly uniformly." },
      { label: "rank",
        value: s.rank,
        tex: "\\frac{(\\sum_i |\\lambda_i|)^2}{\\sum_i \\lambda_i^2}",
        blurb: "Effective rank of B. Roughly, how many distinct directions the composite responds to. A rank near 1 means it acts like a single latent squared; higher ranks mix more directions together." },
      { label: "support",
        value: String(s.support),
        tex: "\\|\\mathrm{down}[k]\\|_0",
        blurb: "Number of encoder latents this composite reads from. Each composite is built from a sparse subset of the autoencoder's latents." },
      { label: "importance",
        value: s.importance,
        tex: "\\sum_i \\lambda_i^2",
        blurb: "How much this composite weighs overall. Computed as the sum of its squared eigenvalues, so composites with more or stronger eigendirections score higher. Normalised so the average reads 1×. A value of 5× means it pulls five times the typical weight." },
      { label: "captured",
        value: captured(meta.eigvals),
        tex: "\\frac{|\\lambda_1| + |\\lambda_2| + |\\lambda_3|}{\\sum_i |\\lambda_i|}",
        blurb: "How much of the composite is captured by the three eigenvectors shown in the 3D scatter. A high value means those three directions explain most of the composite; a low value means the rest of the spectrum still carries real weight." },
    ];
  });

  // Search lives in the URL (?q=…) so it survives navigation and back/forward.
  // The landing page reads the same param to filter its sidebar; on
  // /composite/<id> typing updates the local URL and Enter routes home.
  let query = $derived(page.url.searchParams.get("q") ?? "");
  let inputEl = $state<HTMLInputElement>();

  const setQuery = (v: string) => {
    const url = new URL(page.url);
    if (v) url.searchParams.set("q", v);
    else url.searchParams.delete("q");
    goto(url, { replaceState: true, keepFocus: true, noScroll: true });
  };

  const onInput = (e: Event) => setQuery((e.currentTarget as HTMLInputElement).value);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" && page.url.pathname !== `${base}/`) {
      const q = (e.currentTarget as HTMLInputElement).value;
      goto(q ? `${base}/?q=${encodeURIComponent(q)}` : `${base}/`);
    } else if (e.key === "Escape") {
      setQuery("");
      inputEl?.blur();
    }
  };

  // Expose the input's focus to the app-level keyboard handler in
  // ``+layout.svelte`` (⌘K / "/"). The chrome owns the input; the layout owns
  // the global shortcut surface.
  $effect(() => registerSearchFocus(() => { inputEl?.focus(); inputEl?.select(); }));
</script>

<!-- Drift from bae verbatim: flexbox with ``justify-between`` instead of
     ``grid-cols-[1fr_auto_1fr]``. The grid layout coupled the right column's
     width to half the remaining viewport, which dragged my search wrapper
     toward the middle on wide screens. Flexbox lets left (breadcrumb),
     middle (stats), and right (search + theme) sit at their natural widths
     with the right group pinned to the viewport edge.
     ``pl-2 pr-0``: the left nav gets the 8px breathing room; the right group
     extends to the viewport edge so its right edge aligns with the latent-
     list sidebar below it (also zero right padding). The 8px theme-toggle
     corner inset lives *inside* the right group (``pr-2`` there), keeping
     the equal-distance-from-top-and-side property without sacrificing the
     sidebar alignment. -->
<header class="flex items-center justify-between gap-4 h-14 pl-3 pr-0 border-b border-base-200 bg-base-100">
  <nav aria-label="breadcrumb" class="flex items-center gap-3 min-w-0">
    <!-- Drift from bae verbatim: home link points at the site root (``/``)
         and uses the shared Icon component + daisyUI ``btn btn-ghost`` so the
         button matches the site Navbar's home byte-for-byte (same glyph,
         same hover state, same dimensions). -->
    <a href="/" class="btn btn-ghost btn-square btn-sm shrink-0 text-base-content/65" aria-label="Home">
      <Icon name="house" class="h-4 w-4" />
    </a>
    <div class="flex items-baseline gap-2.5 min-w-0 text-xs font-mono text-base-content/70">
      <HoverCard side="bottom" align="start">
        <span>{BASE_DISPLAY}</span>
        {#snippet tip()}
          <HoverHeader label="model" code={BASE} />
          <ConfigGrid entries={modelEntries} />
        {/snippet}
      </HoverCard>
      <span class="text-base-content/20" aria-hidden="true">/</span>
      <HoverCard side="bottom" align="start">
        <span class="truncate">{NAME_DISPLAY}</span>
        {#snippet tip()}
          <HoverHeader label="autoencoder" code={NAME_DISPLAY} />
          <ConfigGrid entries={aeEntries} />
        {/snippet}
      </HoverCard>
      {#if rows}
        <!-- ``rows`` is non-null only on /composite/[id], so ``page.params.id``
             is guaranteed defined here. SvelteKit types it as ``string |
             undefined`` because the ``page`` store unifies across routes. -->
        {@const compositeId = page.params.id!}
        <span class="text-base-content/20" aria-hidden="true">/</span>
        <HoverCard side="bottom" align="start">
          <span>{compositeId}</span>
          {#snippet tip()}
            <StatTip label="composite" value={compositeId}>
              The active composite. Each composite is a matrix B that combines encoder latents in pairs (so the response is quadratic in the input). This page shows B's eigendecomposition: which directions the composite responds to most strongly.
            </StatTip>
          {/snippet}
        </HoverCard>
      {/if}
    </div>
  </nav>

  <!-- Always rendered (even with no rows) so the navbar's three-track grid
       keeps its shape: breadcrumb in track 1, stats in track 2 (auto, may
       be empty), search in track 3 (1fr, justify-end → right edge). On
       landing the loop is empty and track 2 collapses to 0; search still
       lands at the right. Stats also hide below ``md`` — five number
       pills don't fit on touch widths. -->
  <div class="hidden md:flex items-center gap-9" role="group" aria-label="composite statistics">
    {#each rows ?? [] as r}
      <HoverCard>
        <div class="flex flex-col items-center">
          <span class="text-[10px] uppercase tracking-wider text-base-content/65 leading-none border-b border-dotted border-base-content/15 pb-px">
            {r.label}
          </span>
          <span class="text-sm font-mono tabular-nums text-base-content mt-1">{r.value}</span>
        </div>
        {#snippet tip()}
          <StatTip label={r.label} value={r.value} tex={r.tex}>{r.blurb}</StatTip>
        {/snippet}
      </HoverCard>
    {/each}
  </div>

  <!-- Right group sits at the right edge of the flex header via the parent's
       `justify-between`. Width matches the latent-list sidebar width below
       it (`w-80` = 20rem at md+), and the group's right edge is flush with
       the viewport (header has `pr-0`) so it aligns with the sidebar's
       right edge below. `pr-2` puts the symmetric 8px corner inset inside
       the group, around the theme toggle. Search takes `flex-1` of what's
       left after the corner inset (8px) + gap (8px) + theme (32px) =
       ~272px at md+. -->
  <div class="flex items-center gap-2 shrink-0 w-56 sm:w-64 md:w-80 pr-3">
    <label class="input bg-base-200 border-base-200 focus-within:bg-base-100 focus-within:border-base-300 flex-1">
      <svg class="h-4 w-4 opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
      </svg>
      <input
        bind:this={inputEl}
        value={query}
        oninput={onInput}
        onkeydown={onKey}
        type="search"
        placeholder="search descriptions…"
        aria-label="search composite descriptions" />
      <kbd class="kbd kbd-sm">/</kbd>
    </label>
    <label class="btn btn-ghost btn-square btn-sm swap shrink-0 text-base-content/65" aria-label="Toggle dark mode">
      <input type="checkbox" class="theme-controller" value="dark" />
      <Icon name="sun" class="swap-off h-4 w-4" />
      <Icon name="moon" class="swap-on h-4 w-4" />
    </label>
  </div>
</header>
