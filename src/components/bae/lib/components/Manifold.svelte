<script lang="ts">
  import { ManifoldScene, PALETTE, type Hover, type LabelPosition } from "$lib/manifoldScene";
  import type { PointsData } from "$lib/types";
  import TokenChip from "./TokenChip.svelte";

  // Reactive shell around ``ManifoldScene`` (the imperative Three.js side).
  // Props in via ``$effect`` → method calls; hover + cluster-label state owned
  // here, populated through callbacks the scene fires from its RAF loop.
  // ``window.__manifold`` recorder hook is typed in ``src/app.d.ts``.
  let {
    points,
    axesVisible = false,
    clusterMode = false,
    autoRotate = false,
  }: {
    points: PointsData;
    axesVisible?: boolean;
    clusterMode?: boolean;
    autoRotate?: boolean;
  } = $props();

  // Cluster mode in the scene only when the data carries clusters; the parent
  // pre-checks the toggle, so this is a defence-in-depth re-check.
  let inClusterMode = $derived(clusterMode && !!points.clusters);

  let canvas = $state<HTMLCanvasElement>();
  let scene = $state<ManifoldScene>();
  let hover = $state<Hover | null>(null);
  let tooltipPos = $state({ x: 0, y: 0 });
  let labels = $state<LabelPosition[]>([]);

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  $effect(() => {
    if (!canvas) return;
    const s = new ManifoldScene(canvas, {
      onHover:  (h, pos) => { hover = h; tooltipPos = pos; },
      onLabels: (ls) => { labels = ls; },
    });
    scene = s;
    return () => { scene = undefined; s.dispose(); };
  });

  // ─── Reactive prop → scene sync ────────────────────────────────────────
  // Each effect runs only when its specific prop flips. ``scene?.`` no-ops
  // until the lifecycle effect installs it.
  $effect(() => scene?.setPoints(points));
  $effect(() => scene?.setAxesVisible(axesVisible));
  $effect(() => scene?.setClusterMode(inClusterMode));
  $effect(() => scene?.setAutoRotate(autoRotate));
</script>

<div class="relative w-full h-full">
  <canvas
    bind:this={canvas}
    class="block w-full h-full"
    aria-label="3D scatter of token contexts projected onto the composite's top three eigenvectors"></canvas>
  {#if inClusterMode && points.clusters}
    {#each points.clusters.centroids as c, i (c.id)}
      {#if labels[i]?.visible}
        <div
          aria-hidden="true"
          class="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-md
                 bg-base-100/95 backdrop-blur-sm border text-xs font-mono whitespace-nowrap shadow-sm"
          style="left: {labels[i].x}px; top: {labels[i].y}px;
                 border-color: {PALETTE[c.id]}; color: {PALETTE[c.id]};">
          {c.label}
        </div>
      {/if}
    {/each}
  {/if}
  {#if hover}
    <div
      role="status"
      aria-live="polite"
      class="fixed z-50 pointer-events-none bg-base-100/95 backdrop-blur-sm border border-base-300 text-sm font-mono px-3 py-2 rounded-lg shadow-lg max-w-xl truncate"
      style="left: {tooltipPos.x}px; top: {tooltipPos.y}px;">
      {#if hover.kind === "origin"}
        <span class="text-base-content/70 italic">origin</span>
      {:else}
        {#each hover.tokens as t, i}<TokenChip token={t}
            active={i === hover.center} positive={hover.sign >= 0} />{/each}
      {/if}
    </div>
  {/if}
</div>
