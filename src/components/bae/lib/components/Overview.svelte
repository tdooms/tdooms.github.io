<script lang="ts">
  import { goto, route } from '$lib/navigation.svelte'
  import { format, number as echartsNumber } from 'echarts/core'
  import type { CallbackDataParams } from 'echarts/types/dist/shared'
  import { bindChart } from '../chart'
  import { padId } from '../data'
  import { theme } from '../theme'
  import type { Composite } from '../types'

  type OverviewValue = [
    x: number,
    y: number,
    support: number,
    id: number,
    density: number,
    rank: number,
    importance: number,
    label: string,
  ]

  let {
    composites,
    labelOf = {},
  }: {
    composites: Composite[]
    labelOf?: Record<number, string>
  } = $props()
  let node: HTMLDivElement
  let chart = $state<ReturnType<typeof bindChart> | null>(null)

  $effect(() => {
    const c = (chart = bindChart(node))
    return () => {
      c.dispose()
      chart = null
    }
  })

  $effect(() => {
    const c = chart
    if (!c) return
    const t = $theme
    // Normalise importance so a uniform composite contributes 1.0 (`× uniform`
    // in the tooltip). Backend ships values that sum to 1 across composites,
    // so multiplying by m gives mean = 1.
    const m = composites.length
    // Each datum is one composite; ECharts indexes by ``value[0..]`` in the
    // tooltip formatter, so the order here matches the reads below.
    const data = composites.map((c) => ({
      value: [
        c.umap[0],
        c.umap[1],
        c.support,
        c.id,
        c.density,
        c.rank,
        c.importance * m,
        labelOf[c.id] ?? '',
      ] satisfies OverviewValue,
      name: String(c.id),
    }))
    // ECharts visualMap doesn't auto-derive bounds (VisualMapModel.js: "we do
    // not support the feature 'auto min/max'") — compute extent and round to
    // nice numbers via ECharts' own `nice()` (the helper its axes use).
    // Effective rank is the better discriminator: support (encoder count) is
    // a near-uniform integer in [k, 2k]; rank spans a smooth real range that
    // separates "single-direction" composites from "multi-direction" ones.
    const ranks = composites.map((c) => c.rank)
    const rankMin = echartsNumber.nice(Math.min(...ranks), true)
    const rankMax = echartsNumber.nice(Math.max(...ranks), false)
    // Importance is heavy-tailed: sqrt compresses the long tail; modest
    // amplitude so dots stay readable rather than showy.
    const impMax = Math.max(...data.map((d) => d.value[6]))
    const symSize = (val: OverviewValue) => 2.4 + 7.2 * Math.sqrt(val[6] / impMax)
    c.set({
      backgroundColor: 'transparent',
      animationDuration: 350,
      grid: { left: 16, right: 16, top: 16, bottom: 56, containLabel: false },
      tooltip: {
        // Stay above the point; clamp at plot edges instead of swapping sides.
        position: 'top',
        confine: true,
        className: 'atlas-point-tooltip',
        extraCssText:
          'width: 18rem; max-width: calc(100vw - 2rem); white-space: normal; overflow-wrap: anywhere;',
        backgroundColor: t.base200,
        borderColor: t.base300,
        textStyle: { color: t.baseContent, fontSize: 12 },
        padding: [8, 12],
        // Default trigger ("item") yields one datum at a time. The
        // ``value`` array layout matches ``data.value`` above; cast once.
        formatter: (params) => {
          const p = Array.isArray(params) ? params[0] : params
          if (!p || !Array.isArray(p.value) || p.value.length !== 8) return ''
          const v = p.value as OverviewValue
          // Curated description as the headline; fall back to the composite ID
          // when no label exists (--picks-only runs, missing entries).
          const heading = format.encodeHTML(v[7] || `composite ${padId(v[3])}`)
          // Importance reads ``1.23×`` (mean-normalised) — the exact format
          // the InfoBar stat bar uses, so the two surfaces agree.
          return (
            `<b>${heading}</b> <span style="color:${t.muted}">${padId(v[3])}</span><br>` +
            `<span style="color:${t.muted}">density</span> ${v[4].toFixed(2)}<br>` +
            `<span style="color:${t.muted}">rank</span> ${v[5].toFixed(2)}<br>` +
            `<span style="color:${t.muted}">support</span> ${v[2]}<br>` +
            `<span style="color:${t.muted}">importance</span> ${v[6].toFixed(2)}×`
          )
        },
      },
      // UMAP axes are dimensionless — the absolute coordinates carry no
      // meaning, only relative neighbourhoods do. Hiding labels/lines/ticks
      // keeps the chart purely about the layout. ``scale: true`` still
      // pads the data extent so dots aren't clipped.
      xAxis: {
        type: 'value',
        scale: true,
        show: false,
      },
      yAxis: {
        type: 'value',
        scale: true,
        show: false,
      },
      visualMap: {
        type: 'continuous',
        dimension: 5, // value[5] = rank
        min: rankMin,
        max: rankMax,
        bottom: 12,
        left: 'center',
        calculable: true,
        orient: 'horizontal',
        itemWidth: 14,
        itemHeight: 140,
        textStyle: { fontSize: 11, color: t.muted },
        text: ['', 'rank'], // label on the right (max side)
        inRange: { color: [t.primarySoft, t.primary] },
      },
      series: [
        {
          type: 'scatter',
          data,
          symbolSize: symSize,
          itemStyle: { opacity: 0.7 },
          emphasis: {
            focus: 'self',
            scale: 1.6,
            itemStyle: { opacity: 1, borderColor: t.baseContent, borderWidth: 1 },
          },
          progressive: 1000,
        },
      ],
    })
    c.off('click')
    c.on('click', (params) => {
      const p = params as CallbackDataParams
      if (p.componentType !== 'series' || !Array.isArray(p.value) || p.value.length !== 8) return
      const value = p.value as OverviewValue
      const url = route.url
      url.searchParams.set('composite', padId(value[3]))
      goto(url)
    })
  })
</script>

<div
  bind:this={node}
  role="img"
  aria-label="UMAP overview of {composites.length} composites. Nearby points have similar eigenvalue fingerprints; colour shows effective rank and point size shows importance. Browse or search Results to open a composite."
  class="h-full w-full"
></div>
