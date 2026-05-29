<script>
  import { page } from "$app/state";
  import { base } from "$app/paths";
  import { manifoldState } from "$lib/manifoldState.svelte";
  import Manifold from "$lib/components/Manifold.svelte";
  import CompositeList from "$lib/components/CompositeList.svelte";
  import HoverCard from "$lib/components/HoverCard.svelte";
  import HoverHeader from "$lib/components/HoverHeader.svelte";
  import StatTip from "$lib/components/StatTip.svelte";

  let { children } = $props();

  let meta = $derived(page.data.meta);
  let points = $derived(page.data.points);
  // ``labels`` covers every composite (alive + dead) — see ``dashboard.describe``.
  // Looking up via ``picks`` (top-20 only) was the bug that surfaced ``[placeholder]``
  // for everything outside the curated picks.
  let labels = $derived(page.data.curated.labels);
  let neighbours = $derived(meta.neighbours
    .map(([id, cos]) => ({ id, label: labels[id], value: cos })));

  // TeX strings always live in script (never inline in attributes) — Svelte's template
  // parser treats `{...}` as expression interpolation, so `\mathrm{latents}` would crash
  // with "latents is not defined". String.raw lets us write TeX without backslash doubling.
  const samplingTex = String.raw`w \propto (\|\mathrm{latents}\| + \varepsilon)^4`;
  const simTex = String.raw`\frac{\|U_i^\top U_j\|_F^2}{\sqrt{r_i \, r_j}}`;

  // ``manifoldState`` is shared (module singleton in ``$lib/manifoldState``).
  // Cluster mode also requires a ``cluster.json`` to exist for this composite;
  // we mask the toggle when it doesn't.
  let clusterToggleEffective = $derived(manifoldState.clusterMode && !!points.clusters);

  // One source of truth for the bottom-bar circle buttons — `info` (the two
  // popover-only triggers, never pressed) and `toggle(active)` (the three
  // state-bearing buttons whose look diverges on press).
  const infoBtn = "btn btn-circle btn-sm bg-base-200 border-base-300 text-base-content/70 hover:bg-base-300 hover:text-base-content";
  const toggleBtn = (active) =>
    `btn btn-circle btn-sm border-base-300 ${active
      ? "bg-base-content/10 text-base-content hover:bg-base-content/15"
      : "bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content"}`;
</script>

{#snippet simTip()}
  <StatTip label="similarity" value="subspace overlap" tex={simTex}>
    Geometric overlap between two composites' principal subspaces. Each composite spans a low-rank subspace of the residual stream (its non-trivial eigendirections U). The metric is in [0, 1]: 1 means identical subspaces, 0 means orthogonal. Eigenvalue magnitudes and signs are ignored, this is pure geometry.
  </StatTip>
{/snippet}

<!-- Responsive grid: <md → manifold only; md..xl → detail panel (left) +
     manifold; xl+ → detail + manifold + neighbours list (right).
     Latent list lives on the right so it sits under the navbar's search box;
     the detail panel (stats: firing distribution, spectrum, top activations)
     anchors the left, mirroring the navbar's left-side breadcrumb. -->
<div class="grid grid-rows-1 h-full divide-x divide-base-200
            grid-cols-[1fr] md:grid-cols-[24rem_1fr] xl:grid-cols-[24rem_1fr_20rem]">
  <!-- Detail aside (left). ``overflow-x-visible`` lets HoverCards inside this
       column escape rightward into the manifold pane; the column itself
       still scrolls vertically. Hidden on the smallest viewports — the
       manifold needs the room. -->
  <aside class="hidden md:flex flex-col gap-6 px-6 py-6 overflow-y-auto overflow-x-visible min-h-0">
    {@render children()}
  </aside>

  <section class="relative bg-base-100" data-record-target="manifold">
    <Manifold
      {points}
      axesVisible={manifoldState.axesVisible}
      clusterMode={clusterToggleEffective}
      autoRotate={manifoldState.autoRotate} />
    <div class="absolute bottom-3 left-3 flex items-center gap-2">
      <!-- Keyboard cheatsheet — WASD/QE camera controls live on the
           ``Manifold`` component; the visible legend is colocated with the
           other corner buttons so users find it without hunting. -->
      <HoverCard side="top" align="start">
        <div class={infoBtn} aria-label="keyboard navigation">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="6" width="20" height="12" rx="2"/>
            <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01M14 14h.01M18 14h.01"/>
          </svg>
        </div>
        {#snippet tip()}
          <HoverHeader label="navigation" code="keyboard" />
          <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
            <dt class="font-mono"><kbd class="kbd kbd-xs">W</kbd> <kbd class="kbd kbd-xs">S</kbd></dt>
            <dd class="text-base-content/70 self-center">forward / back</dd>
            <dt class="font-mono"><kbd class="kbd kbd-xs">A</kbd> <kbd class="kbd kbd-xs">D</kbd></dt>
            <dd class="text-base-content/70 self-center">strafe left / right</dd>
            <dt class="font-mono"><kbd class="kbd kbd-xs">Q</kbd> <kbd class="kbd kbd-xs">E</kbd></dt>
            <dd class="text-base-content/70 self-center">down / up</dd>
          </dl>
          <p class="text-xs text-base-content/70 leading-relaxed pt-1 border-t border-base-200">
            Camera and orbit target move together — drag still rotates around the new pivot, wheel still zooms.
          </p>
        {/snippet}
      </HoverCard>
      <HoverCard side="top" align="start">
        <div class={infoBtn} aria-label="sampling info">
          <!-- Scattered-dots icon — denser-near-edges to evoke importance-weighted sampling. -->
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5"  cy="6"  r="1.6"/>
            <circle cx="13" cy="4"  r="1"/>
            <circle cx="19" cy="7"  r="1.6"/>
            <circle cx="9"  cy="11" r="1"/>
            <circle cx="15" cy="13" r="0.9"/>
            <circle cx="4"  cy="17" r="1"/>
            <circle cx="11" cy="19" r="1.6"/>
            <circle cx="20" cy="18" r="1.4"/>
          </svg>
        </div>
        {#snippet tip()}
          <StatTip label="sampling" value="reservoir" tex={samplingTex}>
            Points are reservoir-weighted by (‖latents‖ + ε)⁴. This over-represents points
            far from the origin so the manifold's geometry shows through. Otherwise the dense
            central cluster drowns it out.
          </StatTip>
        {/snippet}
      </HoverCard>
      <!-- Visual divider — info popovers (left) vs action toggles (right). -->
      <div class="w-px h-5 bg-base-300 mx-1"></div>
      <!-- Auto-rotate: gentle horizontal pan around the orbit target. Distance
           and polar angle stay fixed; just azimuth advances. -->
      <button
        type="button"
        class={toggleBtn(manifoldState.autoRotate)}
        aria-pressed={manifoldState.autoRotate}
        aria-label="toggle auto-rotate"
        onclick={() => (manifoldState.autoRotate = !manifoldState.autoRotate)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-2.64-6.36"/>
          <polyline points="21 4 21 10 15 10"/>
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
          onclick={() => (manifoldState.clusterMode = !manifoldState.clusterMode)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="6" cy="7" r="2"/>
            <circle cx="17" cy="6" r="2"/>
            <circle cx="7" cy="17" r="2"/>
            <circle cx="17" cy="17" r="2"/>
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
        onclick={() => (manifoldState.axesVisible = !manifoldState.axesVisible)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="-7 -7 14 14"
             stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
          <line x1="-5" y1="0"  x2="5"  y2="0"  stroke="currentColor" />
          <line x1="0"  y1="-5" x2="0"  y2="5"  stroke="currentColor" />
          <line x1="-3" y1="3"  x2="3"  y2="-3" stroke="currentColor" />
        </svg>
      </button>
    </div>
  </section>

  <!-- Closest-neighbours list (right). Hidden below xl — at smaller widths
       the detail panel + manifold already saturate the row. -->
  <div class="hidden xl:contents">
    <CompositeList
      items={neighbours}
      title="Closest neighbours"
      valueLabel="similarity"
      valueTip={simTip} />
  </div>
</div>
