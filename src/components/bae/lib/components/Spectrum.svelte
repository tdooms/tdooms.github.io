<script lang="ts">
  import type { CallbackDataParams } from "echarts/types/dist/shared";
  import { bindChart } from "../chart";
  import { adaptive } from "../format";
  import { theme } from "../theme";

  // ``axisLabels[i]`` is the label drawn on bar ``i`` (e.g. "X" / "Y" / "Z" for
  // the top-3 |λ| bars that correspond to the 3D scene's axes), or ``null`` for
  // bars that get no label. Static visual link, no hover events.
  let {
    values,
    axisLabels = [],
  }: { values: number[]; axisLabels?: (string | null)[] } = $props();
  let node: HTMLDivElement;
  let chart = $state<ReturnType<typeof bindChart> | null>(null);

  $effect(() => {
    const c = chart = bindChart(node);
    return () => { c.dispose(); chart = null; };
  });

  $effect(() => {
    const c = chart;
    if (!c) return;
    const t = theme();
    // Tick labels: same adaptive precision as elsewhere, with an explicit "0"
    // snap so the central zero line reads cleanly instead of "0.00".
    const tickLabel = (v: number) => v === 0 ? "0" : adaptive(v);
    c.set({
      backgroundColor: "transparent",
      animationDuration: 250,
      grid: { left: 48, right: 16, top: 12, bottom: 24, containLabel: false },
      tooltip: {
        trigger: "axis",
        backgroundColor: t.base200,
        borderColor: t.base300,
        textStyle: { color: t.baseContent, fontSize: 12 },
        // ``trigger: "axis"`` always yields an array of per-series datums.
        formatter: (params) => {
          const p = params as CallbackDataParams[];
          return `λ<sub>${p[0].dataIndex}</sub> = ${(p[0].value as number).toFixed(4)}`;
        },
      },
      xAxis: { type: "category", show: false, data: values.map((_, i) => i) },
      yAxis: {
        type: "value",
        // Symmetric range so the zero line sits in the middle and positive /
        // negative bars get equal visual weight. ECharts accepts min/max as
        // functions over the data extent.
        min: ({ min, max }) => -Math.max(Math.abs(min), Math.abs(max)),
        max: ({ min, max }) =>  Math.max(Math.abs(min), Math.abs(max)),
        splitNumber: 4,
        axisLabel: { fontSize: 11, color: t.faint, formatter: tickLabel },
        splitLine: { lineStyle: { color: t.base200 } },
      },
      series: [{
        type: "bar",
        data: values.map((v, i) => ({
          value: v,
          itemStyle: { color: v >= 0 ? t.primary : t.error },
          label: axisLabels[i]
            ? { show: true, position: v >= 0 ? "top" : "bottom", formatter: axisLabels[i],
                color: t.baseContent, fontSize: 11, fontWeight: 600, distance: 4 }
            : { show: false },
        })),
        barWidth: "85%",
      }],
    });
  });
</script>

<div bind:this={node} class="w-full h-full"></div>
