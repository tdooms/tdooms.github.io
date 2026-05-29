<script lang="ts">
  import { page } from "$app/state";
  import { NAME_DISPLAY } from "$lib/manifest";
  import { manifoldState } from "$lib/manifoldState.svelte";
  import { topSpectrum } from "$lib/stats";
  import Histogram from "$lib/components/Histogram.svelte";
  import Spectrum from "$lib/components/Spectrum.svelte";
  import TopActivations from "$lib/components/TopActivations.svelte";

  let { data } = $props();
  let meta = $derived(data.meta);
  let points = $derived(data.points);
  // Curated description for the active latent, looked up by URL param. Missing
  // entries fall back to ``null`` so the heading shows "no description".
  let label = $derived<string | null>(data.curated.labels[+page.params.id!] ?? null);

  // Top 32 eigenvalues by |λ|, sorted in signed-ascending order for a
  // symmetric bar chart. Labels mark the three bars matching the manifold's
  // X/Y/Z axes — but only when those axes are actually shown in the scene.
  let spectrum = $derived(topSpectrum(meta.eigvals, 32, 3));
  let axisLabels = $derived(manifoldState.axesVisible ? spectrum.labels : []);
</script>

<svelte:head>
  <title>bae · {NAME_DISPLAY} · {label ?? page.params.id}</title>
</svelte:head>

<header class="flex flex-col gap-1 pb-4 border-b border-base-200">
  <span class="text-[11px] uppercase tracking-wider text-base-content/65 font-mono">
    latent {page.params.id}
  </span>
  <h2 class="text-base leading-snug
             {label ? 'text-base-content' : 'italic text-base-content/65'}">
    {label ?? "no description"}
  </h2>
</header>

<section class="flex flex-col gap-2">
  <h3 class="text-[11px] uppercase tracking-wider text-base-content/65">firing distribution</h3>
  <div class="h-36"><Histogram counts={meta.histogram.counts} edges={meta.histogram.edges} /></div>
</section>

<section class="flex flex-col gap-2">
  <h3 class="text-[11px] uppercase tracking-wider text-base-content/65">eigenvalue spectrum · top 32</h3>
  <div class="h-36"><Spectrum values={spectrum.values} {axisLabels} /></div>
</section>

<section class="flex flex-col gap-2 flex-1 min-h-0">
  <h3 class="text-[11px] uppercase tracking-wider text-base-content/65">
    top activations <span class="text-base-content/65 normal-case tracking-normal">(relative)</span>
  </h3>
  <div class="flex-1 min-h-0 overflow-hidden"><TopActivations {points} top={6} /></div>
</section>
