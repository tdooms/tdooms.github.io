<script lang="ts">
  import { page } from "$app/state";
  import { NAME_DISPLAY } from "$lib/manifest";
  import Overview from "$lib/components/Overview.svelte";
  import CompositeList from "$lib/components/CompositeList.svelte";
  import StatTip from "$lib/components/StatTip.svelte";

  let { data } = $props();
  let composites = $derived(data.index.composites);
  let labelOf = $derived(data.curated.labels);

  // Each sidebar row carries the latent's Hoyer density alongside its label —
  // 0 = highly selective, 1 = uniform firing. Same column slot the neighbours
  // sidebar uses for cosine similarity, so the two views read the same way.
  const withDensity = (id: number, label: string) => ({
    id, label, value: data.index.byId.get(id)?.density,
  });

  // Search query lives in the URL (?q=…), set by the navbar input. Empty → the
  // top-20 clustered latents by importance (those with a ``cluster.json`` —
  // deep autointerp work). Any text → live substring filter, capped at 200 so
  // the DOM stays small.
  let query = $derived(page.url.searchParams.get("q") ?? "");
  let sidebar = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return data.clustered
        .filter((id) => labelOf[id])
        .sort((a, b) => (data.index.byId.get(b)?.importance ?? 0)
                      - (data.index.byId.get(a)?.importance ?? 0))
        .slice(0, 20)
        .map((id) => withDensity(id, labelOf[id]));
    }
    const matches = [];
    for (const [id, label] of Object.entries(labelOf)) {
      if (label.toLowerCase().includes(q)) {
        matches.push(withDensity(+id, label));
        if (matches.length >= 200) break;
      }
    }
    return matches;
  });
</script>

<svelte:head><title>bae · {NAME_DISPLAY} · overview</title></svelte:head>

{#snippet densityTip()}
  <StatTip label="density" value="Hoyer">
    Hoyer density of the firing values. 0 means a highly selective latent that
    fires on a sparse subset of tokens; 1 means it fires fairly uniformly.
    Picks are filtered to those with a ``cluster.json`` (deep autointerp work).
  </StatTip>
{/snippet}

<!-- Below md the sidebar disappears and the UMAP scatter takes the full
     width — touch viewports get the chart, no chrome competing for room.
     Latent list sits on the right (under the navbar's search box) — same
     orientation as ``composite/+layout.svelte``. -->
<div class="grid grid-rows-1 h-full divide-x divide-base-200
            grid-cols-[1fr] md:grid-cols-[1fr_20rem]">
  <section class="flex flex-col gap-4 p-6 min-h-0">
    <div class="flex-1 min-h-0">
      <Overview {composites} {labelOf} />
    </div>
  </section>

  <div class="hidden md:contents">
    <CompositeList
      items={sidebar}
      title={query.trim()
        ? `${sidebar.length}${sidebar.length >= 200 ? "+" : ""} matches`
        : "Curated latents"}
      valueLabel="density"
      valueTip={densityTip} />
  </div>
</div>
