import * as echarts from "echarts";

interface ChartHandle {
  set: (option: echarts.EChartsOption) => void;
  on: (event: string, fn: (params: unknown) => void) => void;
  off: (event: string) => void;
  dispose: () => void;
}

/**
 * Bind an echarts instance to a DOM node. Resizes follow the node via
 * ``ResizeObserver``. Caller drives data via ``set(option)``.
 */
export function bindChart(node: HTMLElement): ChartHandle {
  const chart = echarts.init(node);
  const ro = new ResizeObserver(() => chart.resize());
  ro.observe(node);
  return {
    set: (option) => chart.setOption(option, true),
    on:  (event, fn) => chart.on(event, fn),
    off: (event) => chart.off(event),
    dispose: () => { ro.disconnect(); chart.dispose(); },
  };
}
