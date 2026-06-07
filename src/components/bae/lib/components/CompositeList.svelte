<script lang="ts">
  import type { Snippet } from "svelte";
  import { base } from "$app/paths";
  import { padId } from "$lib/data";
  import HoverCard from "$lib/components/HoverCard.svelte";

  // ``valueTip`` is a snippet rendered as the popup body for the value-column
  // header. Pass it from the caller so the explanation lives next to the data
  // definition, not inside this list component. ``valueSide``/``valueAlign``
  // forward to ``HoverCard``; only ``top``/``bottom`` are meaningful — the
  // popup pops above or below the column header.
  interface ListItem { id: number; label: string; value?: number; }
  let {
    items,
    title = null,
    valueLabel = null,
    valueTip = null,
    valueSide = "bottom",
    valueAlign = "end",
  }: {
    items: ListItem[];
    title?: string | null;
    valueLabel?: string | null;
    valueTip?: Snippet | null;
    valueSide?: "top" | "bottom";
    valueAlign?: "start" | "center" | "end";
  } = $props();
</script>

<!-- ``<ul>`` owns its own scroll, so no ``overflow-hidden`` here — that would clip the
     value-label hover card before it could escape into the next grid column. -->
<aside class="flex flex-col min-h-0">
  {#if title}
    <header class="px-4 py-3 border-b border-base-200 flex items-baseline justify-between bg-base-100">
      <span class="text-xs uppercase tracking-wider text-base-content/70 font-semibold">{title}</span>
      {#if valueLabel}
        {#if valueTip}
          <HoverCard side={valueSide} align={valueAlign} width="w-64" tip={valueTip}>
            <span class="text-[10px] uppercase tracking-wider text-base-content/70 font-mono border-b border-dotted border-base-content/20">
              {valueLabel}
            </span>
          </HoverCard>
        {:else}
          <span class="text-[10px] uppercase tracking-wider text-base-content/65 font-mono">{valueLabel}</span>
        {/if}
      {/if}
    </header>
  {/if}
  <ul class="overflow-y-auto flex-1 min-h-0 flex flex-col divide-y divide-base-200">
    {#each items as c}
      <li class="[content-visibility:auto] [contain-intrinsic-size:auto_44px]">
        <a
          href="{base}/composite/{padId(c.id)}"
          data-sveltekit-preload-data="hover"
          class="group grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2.5 hover:bg-base-200/70 transition-colors duration-100">
          <span class="text-sm leading-snug truncate text-base-content/85 group-hover:text-base-content">
            {c.label}
          </span>
          {#if c.value !== undefined}
            <span class="text-xs font-mono tabular-nums shrink-0
                         {c.value < 0 ? 'text-secondary/85' : 'text-base-content/70'}">
              {c.value >= 0 ? c.value.toFixed(2) : `−${(-c.value).toFixed(2)}`}
            </span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
</aside>
