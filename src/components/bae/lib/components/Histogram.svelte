<script lang="ts">
  import type { CallbackDataParams } from "echarts/types/dist/shared";
  import { bindChart } from "../chart";
  import { adaptive, compact } from "../format";
  import { theme, mixLinear } from "../theme";

  // ``counts`` is N bins, ``edges`` is N+1 bin boundaries — the off-by-one is
  // typed so callers don't slip.
  let { counts, edges }: { counts: number[]; edges: number[] } = $props();
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
    const centers = edges.slice(0, -1).map((e, i) => (e + edges[i + 1]) / 2);
    // Largest |h| across the bins — normalises each bar onto the 3D scatter's
    // colour ramp (both signs share one scale, like the dot shader).
    const maxAbs = Math.max(...centers.map((v) => Math.abs(v)), 1e-6);
    // ECharts feeds tick values as strings sometimes (numeric x-axis).
    // Snap a near-zero value to "0" so the central tick reads cleanly.
    const xLabel = (v: number | string) => Math.abs(Number(v)) < 1e-9 ? "0" : adaptive(Number(v));
    c.set({
      backgroundColor: "transparent",
      animationDuration: 250,
      grid: { left: 56, right: 16, top: 12, bottom: 28, containLabel: false },
      tooltip: {
        trigger: "axis",
        // `shadow` makes the entire column hoverable, including zero-count bins
        // whose bars vanish on a log axis. Standard pattern for bar charts.
        axisPointer: { type: "shadow" },
        backgroundColor: t.base200,
        borderColor: t.base300,
        textStyle: { color: t.baseContent, fontSize: 12 },
        // ``trigger: "axis"`` always yields an array of per-series datums.
        // ECharts's option-level ``TooltipFormatterCallback`` is a 7-way union
        // across every trigger / format combination; we narrow once here.
        formatter: (params) => {
          const p = params as CallbackDataParams[];
          const i = p[0].dataIndex;
          return `<span style="color:${t.muted}">h ≈</span> ${xLabel(centers[i])}<br>` +
                 `<span style="color:${t.muted}">count</span> ${counts[i]}`;
        },
      },
      xAxis: {
        // Value-axis lets ECharts pick round-number tick positions automatically.
        type: "value",
        splitNumber: 5,
        axisLabel: { fontSize: 11, color: t.faint, formatter: xLabel },
        axisLine: { lineStyle: { color: t.base300 } },
        axisTick: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        type: "log",
        logBase: 10,
        min: 1,
        axisLabel: { fontSize: 11, color: t.faint, formatter: compact },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: t.base200 } },
      },
      series: [{
        type: "bar",
        // ECharts auto-fits bar width on a value axis to the smallest x-spacing,
        // i.e. one bin. Removing `large` mode + zero-border makes them touch.
        // Each bar is coloured like the 3D dots: neutral at h≈0, ramping to the
        // muted accent toward the tails (|h| → max), capped at 80% to match.
        data: counts.map((c, i) => {
          const accent = centers[i] >= 0 ? t.primary : t.secondary;
          const intensity = Math.min(Math.abs(centers[i]) / maxAbs, 1) * 0.8;
          return {
            value: [centers[i], c],
            itemStyle: { color: mixLinear(accent, t.base300, intensity), borderWidth: 0 },
          };
        }),
        barWidth: "100%",
      }],
    });
  });
</script>

<div bind:this={node} class="w-full h-full"></div>
