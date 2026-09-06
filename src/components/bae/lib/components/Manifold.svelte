<script lang="ts">
  import { ManifoldScene, PALETTE, type Hover, type LabelPosition } from '$lib/manifoldScene'
  import type { PointsData } from '$lib/types'
  import TokenChip from './TokenChip.svelte'

  // Reactive shell around ``ManifoldScene`` (the imperative Three.js side).
  // Props in via ``$effect`` → method calls; hover + cluster-label state owned
  // here, populated through callbacks the scene fires from its RAF loop.
  let {
    points,
    active = true,
    axesVisible = false,
    clusterMode = false,
    autoRotate = false,
  }: {
    points: PointsData
    active?: boolean
    axesVisible?: boolean
    clusterMode?: boolean
    autoRotate?: boolean
  } = $props()

  // Cluster mode in the scene only when the data carries clusters; the parent
  // pre-checks the toggle, so this is a defence-in-depth re-check.
  let inClusterMode = $derived(clusterMode && !!points.clusters)

  let canvas = $state<HTMLCanvasElement>()
  let scene = $state<ManifoldScene>()
  let hover = $state<Hover | null>(null)
  let tooltipPos = $state({ x: 0, y: 0 })
  let labels = $state<LabelPosition[]>([])
  const instructionsId = $props.id()

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  $effect(() => {
    if (!canvas) return
    hover = null
    labels = []
    const s = new ManifoldScene(canvas, points, {
      onHover: (h, pos) => {
        hover = h
        tooltipPos = pos
      },
      onLabels: (ls) => {
        labels = ls
      },
    })
    scene = s
    return () => {
      scene = undefined
      s.dispose()
    }
  })

  // ─── Reactive prop → scene sync ────────────────────────────────────────
  // Each effect runs only when its specific prop flips. ``scene?.`` no-ops
  // until the lifecycle effect installs it.
  $effect(() => scene?.setAxesVisible(axesVisible))
  $effect(() => scene?.setClusterMode(inClusterMode))
  $effect(() => scene?.setAutoRotate(autoRotate))
  $effect(() => scene?.setActive(active))
</script>

<div class="relative h-full w-full">
  <!-- Only the custom 3D viewer takes raw camera keys. Tab leaves this control;
       the surrounding page keeps ordinary document navigation. -->
  <!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role (Canvas permits any role: https://www.w3.org/TR/html-aria/#el-canvas. This named viewer uses the nonstandard keyboard interaction covered by the WAI-ARIA application role.) -->
  <canvas
    bind:this={canvas}
    role="application"
    tabindex="0"
    class="focus-visible:outline-secondary block h-full w-full focus-visible:outline-2 focus-visible:-outline-offset-2"
    aria-label="3D scatter of {points.n} sampled token contexts projected onto the composite's top three eigenvectors"
    aria-describedby={instructionsId}
  ></canvas>
  <p id={instructionsId} class="sr-only">
    While the plot has focus, W and S move forward and back, A and D move left and right, and Q and
    E move down and up. Press Tab to leave the plot. Details contains statistics and a selection of
    token contexts.
  </p>
  {#if inClusterMode && points.clusters}
    {#each points.clusters.centroids as c, i (c.id)}
      {#if labels[i]?.visible}
        <div
          aria-hidden="true"
          class="bg-base-100/95 pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-md border
                 px-2 py-1 font-mono text-xs whitespace-nowrap shadow-sm backdrop-blur-sm"
          style="left: {labels[i].x}px; top: {labels[i].y}px;
                 border-color: {PALETTE[c.id]}; color: {PALETTE[c.id]};"
        >
          {c.label}
        </div>
      {/if}
    {/each}
  {/if}
  {#if hover}
    <div
      role="status"
      aria-live="polite"
      class="bg-base-100/95 border-base-300 pointer-events-none fixed z-50 max-w-[min(28rem,calc(100vw-1rem))] truncate rounded-lg border px-3 py-2 font-mono text-sm shadow-lg backdrop-blur-sm"
      style="left: {tooltipPos.x}px; top: {tooltipPos.y}px;"
    >
      {#if hover.kind === 'origin'}
        <span class="text-base-content/70 italic">origin</span>
      {:else}
        {#each hover.tokens as t, i}<TokenChip
            token={t}
            active={i === hover.center}
            positive={hover.sign >= 0}
          />{/each}
      {/if}
    </div>
  {/if}
</div>
