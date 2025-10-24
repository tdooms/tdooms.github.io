<script lang="ts">
    import { onMount } from 'svelte';
    import { csvParse } from 'd3-dsv';
    let Plotly: any;

    const SAMPLES = [
        { name: 'Year Circle', url: '/demos/manifolds/year-circle.csv' },
        { name: 'New Triangle', url: '/demos/manifolds/new-triangle.csv' },
        { name: 'Negation Directions', url: '/demos/manifolds/negation-directions.csv' },
        { name: 'Conjunction Clusters', url: '/demos/manifolds/conjunction-clusters.csv' }
    ];

    let selected = $state(0);
    let loading = $state(true);
    let chartElement: HTMLDivElement;

    async function set_selected(index: number) {
        selected = index;
        await draw(SAMPLES[selected].url);
    }

    const num = (x: unknown) => {
        const v = +(<any>x);
        return Number.isFinite(v) ? v : null;
    };

    async function draw(url: string) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

        const rows = csvParse(await res.text());
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

        const layout = {
            margin: { l: 0, r: 0, t: 0, b: 0 },
            scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false } },
            showlegend: false
        };

        await Plotly.newPlot(chartElement, [trace, origin], layout, { displayModeBar: false, responsive: true });
    }

    onMount(async () => {
        Plotly = (await import('plotly.js-dist-min')).default;
        await draw(SAMPLES[selected].url);
        loading = false;
    });
</script>


<div class="tabs is-toggle is-centered is-custom mb-2">
    <ul>
        {#each SAMPLES as sample, i}
            <li class={selected === i ? "is-active" : ""}>
                <a onclick={() => set_selected(i)}> {sample.name} </a>
            </li>
        {/each}
    </ul>
</div>

<div class="box">
    {#if loading}
        <div class="loading-container">
            <div class="loader"></div>
        </div>
    {/if}
    <div id="chart" bind:this={chartElement}></div>
</div>

<div class="notification is-grey-light mb-0 mt-2">
    <strong>Position:</strong> Linear projection of activations into 3D subspace*.<br>
    <strong>Color:</strong> Activation strength of the studied bilinear form.<br>
    <strong>Label:</strong> Shows the current token and the predicted token by the model.<br>
    <small>*There may be 'illusory' gaps near the origin due to thresholding of low activations.</small>
</div>

<style>
    .box {
        height: calc(100dvh - 300px);
        overflow: hidden;
        box-sizing: border-box;
        padding: 0;
        margin: 0;
        position: relative;
    }
    
    #chart {
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    .loading-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.9);
        z-index: 10;
    }

    .loader {
        border: 4px solid #f3f3f3;
        border-top: 4px solid var(--bulma-tabs-toggle-link-active-background-color, #3273dc);
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    :global(.hovertext text) {
        font-size: 16px !important;
        font-weight: bold !important;
    }
</style>