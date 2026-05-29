<script lang="ts">
  import { base } from "$app/paths";

  let { data } = $props();
</script>

<svelte:head><title>bae · experiments</title></svelte:head>

<div class="flex flex-col gap-4 p-6 max-w-3xl mx-auto w-full">
  <header class="flex flex-col gap-1">
    <h1 class="text-xl font-semibold">Experiments</h1>
    <p class="text-sm text-base-content/70">
      Hand-rolled probes from <code class="font-mono">workspace/transient/</code>.
      Each entry is a self-contained dump — manifest + per-item feathers — that the
      route below renders side-by-side.
    </p>
  </header>

  {#if data.experiments.length === 0}
    <p class="text-sm text-base-content/70 italic">No experiments yet.</p>
  {:else}
    <ul class="flex flex-col divide-y divide-base-200 border border-base-200 rounded">
      {#each data.experiments as exp}
        <li>
          <a
            href="{base}/experiments/{exp.slug}"
            class="grid grid-cols-[1fr_auto] items-baseline gap-3 px-4 py-3 hover:bg-base-200/70 transition-colors">
            <span class="text-sm text-base-content/85">{exp.title}</span>
            <code class="text-[10px] uppercase tracking-wider text-base-content/70 font-mono">{exp.kind}</code>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>
