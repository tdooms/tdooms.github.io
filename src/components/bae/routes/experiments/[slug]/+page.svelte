<script lang="ts">
  import { base } from "$app/paths";
  import Manifold from "$lib/components/Manifold.svelte";

  let { data } = $props();
  // Three-up grid for any item count; rows wrap automatically. The cell aspect
  // is fixed so the canvases land on a stable grid regardless of viewport.
  const cols = 3;
</script>

<svelte:head><title>bae · {data.manifest.title}</title></svelte:head>

<div class="flex flex-col gap-4 p-6 min-h-0 h-full overflow-y-auto">
  <header class="flex flex-col gap-1">
    <a href="{base}/experiments" class="text-xs text-base-content/70 hover:text-base-content/70 transition-colors w-fit">
      ← experiments
    </a>
    <h1 class="text-xl font-semibold">{data.manifest.title}</h1>
    {#if data.manifest.subtitle}
      <p class="text-sm text-base-content/70">{data.manifest.subtitle}</p>
    {/if}
  </header>

  <div class="grid gap-3" style="grid-template-columns: repeat({cols}, minmax(0, 1fr));">
    {#each data.manifest.items as item, i}
      <figure class="flex flex-col gap-1 border border-base-200 rounded overflow-hidden bg-base-100">
        <div class="aspect-square">
          <Manifold points={data.points[i]} axesVisible={false} clusterMode={false} autoRotate={false} />
        </div>
        <figcaption class="px-3 py-2 text-xs text-base-content/70 border-t border-base-200 font-mono">
          {item.label}
        </figcaption>
      </figure>
    {/each}
  </div>
</div>
