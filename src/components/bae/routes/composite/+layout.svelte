<script lang="ts">
  import { MediaQuery } from 'svelte/reactivity'
  import type { AtlasIndex, AtlasComposite } from '$lib/types'
  import { NAME_DISPLAY } from '$lib/manifest'
  import { manifoldState } from '$lib/manifoldState.svelte'
  import Manifold from '$lib/components/Manifold.svelte'
  import CompositeList from '$lib/components/CompositeList.svelte'
  import HoverCard from '$lib/components/HoverCard.svelte'
  import HoverHeader from '$lib/components/HoverHeader.svelte'
  import StatTip from '$lib/components/StatTip.svelte'
  import CompositePage from './[id]/+page.svelte'
  import PanelPicker from '$lib/components/PanelPicker.svelte'

  let { data }: { data: AtlasIndex & AtlasComposite } = $props()

  let meta = $derived(data.meta)
  let points = $derived(data.points)
  const wide = new MediaQuery('(min-width: 1280px)')
  const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)')
  let panel = $state('composite-plot')
  let plotActive = $derived(wide.current || panel === 'composite-plot')
  $effect(() => {
    if (reducedMotion.current) manifoldState.autoRotate = false
  })
  // ``labels`` covers every composite (alive + dead) — see ``dashboard.describe``.
  // Looking up via ``picks`` (top-20 only) was the bug that surfaced ``[placeholder]``
  // for everything outside the curated picks.
  let labels = $derived(data.curated.labels)
  let neighbours = $derived(
    meta.neighbours.map(([id, cos]) => ({ id, label: labels[id] ?? String(id), value: cos })),
  )

  // TeX strings always live in script (never inline in attributes) — Svelte's template
  // parser treats `{...}` as expression interpolation, so `\mathrm{latents}` would crash
  // with "latents is not defined". String.raw lets us write TeX without backslash doubling.
  const samplingTex = String.raw`w \propto (\|\mathrm{latents}\| + \varepsilon)^4`
  const simTex = String.raw`\frac{\|U_i^\top U_j\|_F^2}{\sqrt{r_i \, r_j}}`

  // ``manifoldState`` is shared (module singleton in ``$lib/manifoldState``).
  // Cluster mode also requires a ``cluster.json`` to exist for this composite;
  // we mask the toggle when it doesn't.
  let clusterToggleEffective = $derived(manifoldState.clusterMode && !!points.clusters)

  // One source of truth for the bottom-bar circle buttons — `info` (the two
  // popover-only triggers, never pressed) and `toggle(active)` (the three
  // state-bearing buttons whose look diverges on press).
  const infoBtn =
    'btn btn-circle btn-sm bg-base-200 border-base-300 text-base-content/70 hover:bg-base-300 hover:text-base-content'
  const toggleBtn = (active: boolean) =>
    `btn btn-circle btn-sm border-base-300 ${
      active
        ? 'bg-base-content/10 text-base-content hover:bg-base-content/15'
        : 'bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content'
    }`
</script>

<svelte:head>
  <title>bae · {NAME_DISPLAY} · {labels[meta.latent_id] ?? meta.latent_id}</title>
</svelte:head>

{#snippet simTip()}
  <StatTip label="similarity" value="subspace overlap" tex={simTex}>
    Geometric overlap between two composites' principal subspaces. Each composite spans a low-rank
    subspace of the residual stream (its non-trivial eigendirections U). The metric is in [0, 1]: 1
    means identical subspaces, 0 means orthogonal. Eigenvalue magnitudes and signs are ignored, this
    is pure geometry.
  </StatTip>
{/snippet}

<div class="flex h-full min-h-0 flex-col">
  <div class="xl:hidden">
    <PanelPicker
      panels={[
        { id: 'composite-plot', label: 'Plot' },
        { id: 'composite-details', label: 'Details' },
        { id: 'composite-related', label: 'Related' },
      ]}
      bind:value={panel}
    />
  </div>
  <div
    class="divide-base-200 grid min-h-0 flex-1 grid-cols-1 grid-rows-1 xl:grid-cols-[24rem_1fr_20rem] xl:divide-x"
  >
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (Focus enables native keyboard scrolling; covered by the accessibility browser test.) -->
    <aside
      id="composite-details"
      tabindex="0"
      class="focus-visible:outline-secondary min-h-0 flex-col gap-6 overflow-y-auto p-6 focus-visible:outline-2 focus-visible:-outline-offset-2 {wide.current ||
      panel === 'composite-details'
        ? 'flex'
        : 'hidden'}"
      aria-label="Composite details"
    >
      {#if wide.current || panel === 'composite-details'}
        <CompositePage {data} />
      {/if}
    </aside>

    <section
      id="composite-plot"
      aria-label="Composite plot"
      class="bg-base-100 relative min-h-0 {plotActive ? '' : 'hidden'}"
    >
      <Manifold
        {points}
        active={plotActive}
        axesVisible={manifoldState.axesVisible}
        clusterMode={clusterToggleEffective}
        autoRotate={manifoldState.autoRotate}
      />
      <div class="absolute bottom-3 left-3 flex items-center gap-2">
        <!-- Keyboard cheatsheet — WASD/QE camera controls live on the
           ``Manifold`` component; the visible legend is colocated with the
           other corner buttons so users find it without hunting. -->
        <HoverCard side="top" align="start" label="Keyboard navigation">
          <span class={infoBtn}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path
                d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01M14 14h.01M18 14h.01"
              />
            </svg>
          </span>
          {#snippet tip()}
            <HoverHeader label="navigation" code="keyboard" />
            <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
              <dt class="font-mono">
                <kbd class="kbd kbd-xs">W</kbd> <kbd class="kbd kbd-xs">S</kbd>
              </dt>
              <dd class="text-base-content/70 self-center">forward / back</dd>
              <dt class="font-mono">
                <kbd class="kbd kbd-xs">A</kbd> <kbd class="kbd kbd-xs">D</kbd>
              </dt>
              <dd class="text-base-content/70 self-center">strafe left / right</dd>
              <dt class="font-mono">
                <kbd class="kbd kbd-xs">Q</kbd> <kbd class="kbd kbd-xs">E</kbd>
              </dt>
              <dd class="text-base-content/70 self-center">down / up</dd>
            </dl>
            <p class="text-base-content/70 border-base-200 border-t pt-1 text-xs leading-relaxed">
              Focus the plot to use these keys. Drag rotates around the camera's pivot; the wheel
              zooms.
            </p>
          {/snippet}
        </HoverCard>
        <HoverCard side="top" align="start" label="Sampling information">
          <span class={infoBtn}>
            <!-- Scattered-dots icon — denser-near-edges to evoke importance-weighted sampling. -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="5" cy="6" r="1.6" />
              <circle cx="13" cy="4" r="1" />
              <circle cx="19" cy="7" r="1.6" />
              <circle cx="9" cy="11" r="1" />
              <circle cx="15" cy="13" r="0.9" />
              <circle cx="4" cy="17" r="1" />
              <circle cx="11" cy="19" r="1.6" />
              <circle cx="20" cy="18" r="1.4" />
            </svg>
          </span>
          {#snippet tip()}
            <StatTip label="sampling" value="reservoir" tex={samplingTex}>
              Points are reservoir-weighted by (‖latents‖ + ε)⁴. This over-represents points far
              from the origin so the manifold's geometry shows through. Otherwise the dense central
              cluster drowns it out.
            </StatTip>
          {/snippet}
        </HoverCard>
        <!-- Visual divider — info popovers (left) vs action toggles (right). -->
        <div class="bg-base-300 mx-1 h-5 w-px"></div>
        <!-- Auto-rotate: gentle horizontal pan around the orbit target. Distance
           and polar angle stay fixed; just azimuth advances. -->
        <button
          type="button"
          class={toggleBtn(manifoldState.autoRotate)}
          aria-pressed={manifoldState.autoRotate}
          aria-label="toggle auto-rotate"
          onclick={() => (manifoldState.autoRotate = !manifoldState.autoRotate)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <polyline points="21 4 21 10 15 10" />
          </svg>
        </button>
        <!-- Cluster mode: show only when ``cluster.json`` exists for this composite
           (produced by ``uv run cluster <id>``). Toggles cluster-coloured
           rendering with floating centroid labels in place. -->
        {#if points.clusters}
          <button
            type="button"
            class={toggleBtn(manifoldState.clusterMode)}
            aria-pressed={manifoldState.clusterMode}
            aria-label="toggle cluster colouring"
            onclick={() => (manifoldState.clusterMode = !manifoldState.clusterMode)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="6" cy="7" r="2" />
              <circle cx="17" cy="6" r="2" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </button>
        {/if}
        <!-- Axes toggle: plain button. Wrapping in HoverCard would nest two
           interactive elements (popover trigger + click target) and the
           inner button's click would be absorbed by the wrapper. The
           three-axis glyph speaks for itself. -->
        <button
          type="button"
          class={toggleBtn(manifoldState.axesVisible)}
          aria-pressed={manifoldState.axesVisible}
          aria-label="toggle eigenvalue axes"
          onclick={() => (manifoldState.axesVisible = !manifoldState.axesVisible)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="-7 -7 14 14"
            stroke-width="1.6"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <line x1="-5" y1="0" x2="5" y2="0" stroke="currentColor" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="currentColor" />
            <line x1="-3" y1="3" x2="3" y2="-3" stroke="currentColor" />
          </svg>
        </button>
      </div>
    </section>

    <div
      id="composite-related"
      class="min-h-0 flex-col {wide.current || panel === 'composite-related' ? 'flex' : 'hidden'}"
    >
      {#if wide.current || panel === 'composite-related'}
        <CompositeList
          items={neighbours}
          title="Closest neighbours"
          valueLabel="similarity"
          valueTip={simTip}
        />
      {/if}
    </div>
  </div>
</div>
