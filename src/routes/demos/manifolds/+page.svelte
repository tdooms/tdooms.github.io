<script lang="ts">
  import { onMount } from 'svelte';
  import Plotly from 'plotly.js-dist-min';
  import { csvParse } from 'd3-dsv';

  const CSV_FILES = [
    { name: 'Year Circle', url: '/demos/manifolds/year-circle.csv' },
    { name: 'New Triangle', url: '/demos/manifolds/new-triangle.csv' },
    { name: 'Negation Directions', url: '/demos/manifolds/negation-directions.csv' },
    { name: 'Conjunction Clusters', url: '/demos/manifolds/conjunction-clusters.csv' }
  ];

  let selected = CSV_FILES[0].url;
  let chartEl: HTMLDivElement;

  const num = (x: unknown) => {
    const v = +(<any>x);
    return Number.isFinite(v) ? v : null;
  };

  async function loadCSV(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return csvParse(await res.text());
  }

  async function draw(url: string) {
    const rows = await loadCSV(url);
    const x: number[] = [], y: number[] = [], z: number[] = [], c: number[] = [], text: string[] = [];
    for (const r of rows as any[]) {
      const xi = num(r.x), yi = num(r.y), zi = num(r.z), vi = num(r.value);
      if (xi == null || yi == null || zi == null || vi == null) continue;
      x.push(xi); y.push(yi); z.push(zi); c.push(vi); text.push(r.token ?? '');
    }

    const origin = {
      type: 'scatter3d',
      mode: 'markers',
      x: [0], y: [0], z: [0],
      hovertemplate: 'Origin<extra></extra>',
      marker: { size: 18, color: '#282828' }
    };

    const trace = {
      type: 'scatter3d',
      mode: 'markers',
      x, y, z,
      text,
      hovertemplate: '%{text}<extra></extra>',
      marker: {
        size: 7,
        color: c,
        colorscale: [
          [0, 'rgb(222,235,247)'],
          [0.2, 'rgb(158,202,225)'],
          [0.4, 'rgb(107,174,214)'],
          [0.6, 'rgb(66,146,198)'],
          [0.8, 'rgb(33,113,181)'],
          [1, 'rgb(8,69,148)']
        ],
        reversescale: false,
        showscale: false
      }
    };

    await Plotly.newPlot(chartEl, [trace, origin], {
      margin: { l: 0, r: 0, t: 0, b: 0 },
      scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false } }
    }, { displayModeBar: false });
  }

  onMount(() => {
    // larger hover text
    const s = document.createElement('style');
    s.textContent = `.hovertext text{font-size:16px!important;font-weight:bold!important}`;
    document.head.appendChild(s);
    draw(selected);
    const onResize = () => Plotly.Plots.resize(chartEl);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  async function onChange() {
    await draw(selected);
  }
</script>

<style>
  .page { height: 100vh; width: 100vw; display: grid; place-items: center; }
  .controls {
    position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
    z-index: 10; background: rgba(255,255,255,.9); padding: 6px 8px; border: 1px solid #ccc; border-radius: 6px;
  }
  .info {
    position: absolute; top: 10px; right: 10px; z-index: 10;
    background: rgba(255,255,255,.9); padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 12px; max-width: 350px;
  }
  #chart { height: 100vh; width: 100vw; }
</style>

<div class="page">
  <div class="controls">
    <select bind:value={selected} on:change={onChange}>
      {#each CSV_FILES as f}<option value={f.url}>{f.name}</option>{/each}
    </select>
  </div>

  <div class="info">
    <strong>Position:</strong> Linear projection of activations into 3D subspace<br>
    <strong>Color:</strong> Activation strength of the studied bilinear form<br>
    <strong>Label:</strong> Current token → predicted token<br><br>
    There may be ‘illusory’ gaps near the origin due to thresholding of low activations.
  </div>

  <div id="chart" bind:this={chartEl}></div>
</div>
