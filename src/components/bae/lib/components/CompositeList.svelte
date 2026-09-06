<script lang="ts">
  import type { Snippet } from 'svelte'
  import { base, route } from '$lib/navigation.svelte'
  import { padId } from '$lib/data'
  import HoverCard from '$lib/components/HoverCard.svelte'

  // ``valueTip`` is a snippet rendered as the popup body for the value-column
  // header. Pass it from the caller so the explanation lives next to the data
  // definition, not inside this list component. ``valueSide``/``valueAlign``
  // forward to ``HoverCard``; only ``top``/``bottom`` are meaningful — the
  // popup pops above or below the column header.
  interface ListItem {
    id: number
    label: string
    value?: number | undefined
  }
  let {
    items,
    title = null,
    valueLabel = null,
    valueTip = null,
    valueSide = 'bottom',
    valueAlign = 'end',
  }: {
    items: ListItem[]
    title?: string | null
    valueLabel?: string | null
    valueTip?: Snippet | null
    valueSide?: 'top' | 'bottom'
    valueAlign?: 'start' | 'center' | 'end'
  } = $props()

  let query = $derived(route.url.searchParams.get('q') ?? '')
</script>

<!-- ``<ul>`` owns its own scroll, so no ``overflow-hidden`` here — that would clip the
     value-label hover card before it could escape into the next grid column. -->
<aside class="flex min-h-0 flex-1 flex-col" aria-label={title ?? 'Composites'}>
  {#if title}
    <header
      class="border-base-200 bg-base-100 flex items-baseline justify-between border-b px-4 py-3"
    >
      <span class="text-base-content/70 text-xs font-semibold tracking-wider uppercase"
        >{title}</span
      >
      {#if valueLabel}
        {#if valueTip}
          <HoverCard side={valueSide} align={valueAlign} width="w-64" tip={valueTip}>
            <span
              class="text-base-content/70 border-base-content/20 border-b border-dotted font-mono text-[10px] tracking-wider uppercase"
            >
              {valueLabel}
            </span>
          </HoverCard>
        {:else}
          <span class="text-base-content/65 font-mono text-[10px] tracking-wider uppercase"
            >{valueLabel}</span
          >
        {/if}
      {/if}
    </header>
  {/if}
  <ul class="divide-base-200 flex min-h-0 flex-1 flex-col divide-y overflow-y-auto">
    {#each items as c}
      <li class="[contain-intrinsic-size:auto_44px] [content-visibility:auto]">
        <a
          href="{base}/?composite={padId(c.id)}{query ? `&q=${encodeURIComponent(query)}` : ''}"
          data-astro-prefetch="false"
          class="group hover:bg-base-200/70 grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2.5 transition-colors duration-100"
        >
          <span
            class="text-base-content/85 group-hover:text-base-content truncate text-sm leading-snug"
          >
            {c.label}
          </span>
          {#if c.value !== undefined}
            <span
              class="shrink-0 font-mono text-xs tabular-nums
                         {c.value < 0 ? 'text-secondary/85' : 'text-base-content/70'}"
            >
              {c.value >= 0 ? c.value.toFixed(2) : `−${(-c.value).toFixed(2)}`}
            </span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
</aside>
