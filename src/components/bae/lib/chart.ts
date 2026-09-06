import { init, use } from 'echarts/core'
import { BarChart, ScatterChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, VisualMapContinuousComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts/types/dist/option'

// Register the features used by Overview, Histogram and Spectrum. Importing
// the full ECharts entry also ships every unused chart type and renderer.
use([
  BarChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  VisualMapContinuousComponent,
  CanvasRenderer,
])

interface ChartHandle {
  set: (option: EChartsOption) => void
  on: (event: string, fn: (params: unknown) => void) => void
  off: (event: string) => void
  dispose: () => void
}

/**
 * Bind an echarts instance to a DOM node. Resizes follow the node via
 * ``ResizeObserver``. Caller drives data via ``set(option)``.
 */
export function bindChart(node: HTMLElement): ChartHandle {
  const chart = init(node)
  const ro = new ResizeObserver(() => chart.resize())
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  let animation = true
  const updateMotion = () =>
    chart.setOption({
      animation: animation && !motion.matches,
      tooltip: {
        // A tooltip should identify the current mark without drifting from the last one.
        transitionDuration: 0,
        axisPointer: { animation: motion.matches ? false : 'auto' },
      },
    })
  ro.observe(node)
  motion.addEventListener('change', updateMotion)
  updateMotion()
  return {
    // Each view keeps one series of the same type. Merge palette/data updates
    // so the overview's user-selected rank range survives a theme change.
    set: (option) => {
      if (option.animation !== undefined) animation = option.animation
      chart.setOption({ ...option, animation: animation && !motion.matches })
    },
    on: (event, fn) => chart.on(event, fn),
    off: (event) => chart.off(event),
    dispose: () => {
      ro.disconnect()
      motion.removeEventListener('change', updateMotion)
      chart.dispose()
    },
  }
}
