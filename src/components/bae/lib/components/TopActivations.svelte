<script lang="ts">
  import type { PointsData } from '../types'
  import TokenChip from './TokenChip.svelte'

  // Text keeps full contrast; sign uses the same two accents as the scatter.
  let { points, top = 6 }: { points: PointsData; top?: number } = $props()

  let split = $derived.by(() => {
    const { activation, context, contextLength, vocab } = points
    const indexed = Array.from(activation, (value, index) => ({ value, index }))
    const positive = indexed
      .filter(({ value }) => value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, top)
    const negative = indexed
      .filter(({ value }) => value < 0)
      .sort((a, b) => a.value - b.value)
      .slice(0, top)
    const centre = contextLength >> 1

    const row = ({ index, value }: { index: number; value: number }) => {
      const ids = context.subarray(index * contextLength, (index + 1) * contextLength)
      const tokens = Array.from(ids, (id) => vocab[id]!)
      return { tokens, centre, value }
    }
    return { positive: positive.map(row), negative: negative.map(row) }
  })

  const fmt = (v: number) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2)
</script>

<div class="flex flex-col gap-3">
  {#each [{ rows: split.positive, tone: 'primary' }, { rows: split.negative, tone: 'secondary' }] as { rows, tone }}
    {#if rows.length}
      <section class="flex flex-col">
        <ul class="flex flex-col font-mono text-xs">
          {#each rows as row}
            <li class="hover:bg-base-200 flex items-baseline gap-2 rounded-sm py-1">
              <span
                class="w-12 shrink-0 text-right font-semibold tabular-nums {tone === 'primary'
                  ? 'text-primary'
                  : 'text-secondary'}">{fmt(row.value)}</span
              >
              <span class="min-w-0 flex-1 break-all whitespace-pre-wrap">
                {#each row.tokens as t, i}<TokenChip
                    token={t}
                    active={i === row.centre}
                    positive={tone === 'primary'}
                  />{/each}
              </span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  {/each}
</div>
