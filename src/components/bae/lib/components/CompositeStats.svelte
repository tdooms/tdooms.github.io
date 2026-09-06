<script lang="ts">
  import { compositeStats, captured } from '$lib/stats'
  import type { AtlasData } from '$lib/types'
  import HoverCard from './HoverCard.svelte'
  import StatTip from './StatTip.svelte'

  let { data, compact = false }: { data: AtlasData; compact?: boolean } = $props()

  interface StatRow {
    label: string
    value: string
    tex: string
    blurb: string
  }

  // One presentation of the same five measurements in the header and Details.
  let rows = $derived.by<StatRow[]>(() => {
    if (!data.meta) return []
    const { meta, index } = data
    const composite = index.byId.get(meta.latent_id)
    if (!composite) throw new Error(`Missing composite ${meta.latent_id} in index`)
    const s = compositeStats(composite, index.composites.length)
    return [
      {
        label: 'density',
        value: s.density,
        tex: '\\frac{\\|h\\|_1 / \\|h\\|_2 - 1}{\\sqrt{n} - 1}',
        blurb:
          'Hoyer density of the firing values over the cache. Close to 0 means the composite is highly selective, firing on a small fraction of tokens. Close to 1 means it fires fairly uniformly.',
      },
      {
        label: 'rank',
        value: s.rank,
        tex: '\\frac{(\\sum_i |\\lambda_i|)^2}{\\sum_i \\lambda_i^2}',
        blurb:
          'Effective rank of B. Roughly, how many distinct directions the composite responds to. A rank near 1 means it acts like a single latent squared; higher ranks mix more directions together.',
      },
      {
        label: 'support',
        value: String(s.support),
        tex: '\\|\\mathrm{down}[k]\\|_0',
        blurb:
          "Number of encoder latents this composite reads from. Each composite is built from a sparse subset of the autoencoder's latents.",
      },
      {
        label: 'importance',
        value: s.importance,
        tex: '\\sum_i \\lambda_i^2',
        blurb:
          'How much this composite weighs overall. Computed as the sum of its squared eigenvalues, so composites with more or stronger eigendirections score higher. Normalised so the average reads 1×. A value of 5× means it pulls five times the typical weight.',
      },
      {
        label: 'captured',
        value: captured(meta.eigvals),
        tex: '\\frac{|\\lambda_1| + |\\lambda_2| + |\\lambda_3|}{\\sum_i |\\lambda_i|}',
        blurb:
          'How much of the composite is captured by the three eigenvectors shown in the 3D scatter. A high value means those three directions explain most of the composite; a low value means the rest of the spectrum still carries real weight.',
      },
    ]
  })
</script>

<div
  role="group"
  aria-label="Composite statistics"
  class={compact ? 'flex items-center gap-9' : 'grid grid-cols-3 gap-x-4 gap-y-3'}
>
  {#each rows as row}
    <HoverCard>
      <span class="flex flex-col items-center">
        <span
          class="text-base-content/70 border-base-content/15 border-b border-dotted pb-px text-xs"
        >
          {row.label}
        </span>
        <span class="text-base-content mt-1 font-mono text-sm tabular-nums">{row.value}</span>
      </span>
      {#snippet tip()}
        <StatTip label={row.label} value={row.value} tex={row.tex}>{row.blurb}</StatTip>
      {/snippet}
    </HoverCard>
  {/each}
</div>
