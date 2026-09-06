<script lang="ts">
  import type { AtlasIndex, AtlasComposite } from '$lib/types'
  import { manifoldState } from '$lib/manifoldState.svelte'
  import { topSpectrum } from '$lib/stats'
  import Histogram from '$lib/components/Histogram.svelte'
  import Spectrum from '$lib/components/Spectrum.svelte'
  import TopActivations from '$lib/components/TopActivations.svelte'
  import CompositeStats from '$lib/components/CompositeStats.svelte'

  let { data }: { data: AtlasIndex & AtlasComposite } = $props()
  let meta = $derived(data.meta)
  let points = $derived(data.points)
  // Curated description for the active latent, looked up by URL param. Missing
  // entries fall back to ``null`` so the heading shows "no description".
  let label = $derived<string | null>(data.curated.labels[meta.latent_id] ?? null)

  // Top 32 eigenvalues by |λ|, sorted in signed-ascending order for a
  // symmetric bar chart. Labels mark the three bars matching the manifold's
  // X/Y/Z axes — but only when those axes are actually shown in the scene.
  let spectrum = $derived(topSpectrum(meta.eigvals, 32, 3))
  let axisLabels = $derived(manifoldState.axesVisible ? spectrum.labels : [])
  let histogramOpen = $state(false)
  let spectrumOpen = $state(false)
  // Keep table values readable; the cell title retains the full loaded value.
  const formatValue = (value: number) => Number(value.toPrecision(6)).toString()
</script>

<header class="border-base-200 flex flex-col gap-1 border-b pb-4">
  <span class="text-base-content/65 font-mono text-[11px] tracking-wider uppercase">
    latent {meta.latent_id}
  </span>
  <h2
    class="text-base leading-snug
             {label ? 'text-base-content' : 'text-base-content/65 italic'}"
  >
    {label ?? 'no description'}
  </h2>
</header>

<div class="xl:hidden"><CompositeStats {data} /></div>

<section class="flex flex-col gap-2">
  <h3 class="text-base-content/65 text-[11px] tracking-wider uppercase">firing distribution</h3>
  <div class="h-36"><Histogram counts={meta.histogram.counts} edges={meta.histogram.edges} /></div>
  <details bind:open={histogramOpen} class="text-base-content/70 text-xs">
    <summary
      class="focus-visible:outline-primary cursor-pointer rounded-sm py-1 focus-visible:outline-2"
    >
      View values <span class="sr-only">for firing distribution</span>
    </summary>
    {#if histogramOpen}
      <table class="table-xs table w-full table-fixed [&_td]:break-all">
        <caption class="sr-only"
          >Firing distribution values, rounded to six significant digits</caption
        >
        <thead
          ><tr><th scope="col">From</th><th scope="col">To</th><th scope="col">Count</th></tr
          ></thead
        >
        <tbody>
          {#each meta.histogram.counts as count, i}
            <tr>
              <td title={String(meta.histogram.edges[i])}
                >{formatValue(meta.histogram.edges[i]!)}</td
              >
              <td title={String(meta.histogram.edges[i + 1])}
                >{formatValue(meta.histogram.edges[i + 1]!)}</td
              >
              <td>{count}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </details>
</section>

<section class="flex flex-col gap-2">
  <h3 class="text-base-content/65 text-[11px] tracking-wider uppercase">
    eigenvalue spectrum · top 32
  </h3>
  <div class="h-36"><Spectrum values={spectrum.values} {axisLabels} /></div>
  <details bind:open={spectrumOpen} class="text-base-content/70 text-xs">
    <summary
      class="focus-visible:outline-primary cursor-pointer rounded-sm py-1 focus-visible:outline-2"
    >
      View values <span class="sr-only">for eigenvalue spectrum</span>
    </summary>
    {#if spectrumOpen}
      <table class="table-xs table w-full table-fixed [&_td]:break-all">
        <caption class="sr-only"
          >Eigenvalue spectrum values, relative to the largest absolute eigenvalue, rounded to six
          significant digits</caption
        >
        <thead
          ><tr><th scope="col">Bar</th><th scope="col">Value</th><th scope="col">Axis</th></tr
          ></thead
        >
        <tbody>
          {#each spectrum.values as value, i}
            <tr
              ><td>{i + 1}</td><td title={String(value)}>{formatValue(value)}</td><td
                >{spectrum.labels[i] ?? ''}</td
              ></tr
            >
          {/each}
        </tbody>
      </table>
    {/if}
  </details>
</section>

<section class="flex flex-col gap-2">
  <h3 class="text-base-content/65 text-[11px] tracking-wider uppercase">
    top activations <span class="text-base-content/65 tracking-normal normal-case">(relative)</span>
  </h3>
  <div><TopActivations {points} top={6} /></div>
</section>
