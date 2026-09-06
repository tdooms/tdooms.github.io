<script lang="ts">
  // Two-column ``<dl>`` of (key, value) entries — uppercase term on the left,
  // monospace definition on the right. Used by both the model and AE breadcrumb
  // hovers in InfoBar; identical typography lives in one place.
  let { entries }: { entries: [string, string | number][] } = $props()
</script>

<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
  {#each entries as [k, v]}
    <dt class="text-base-content/70 tracking-wider uppercase">{k}</dt>
    <dd class="text-base-content/85 text-right font-mono tabular-nums">{v}</dd>
  {/each}
</dl>
