<script lang="ts">
    import { onMount } from 'svelte';
    import { tableFromIPC } from 'apache-arrow';
    
    type Sample = {
        name: string;
        url: string;
        slug: string;
    };
    
    type Props = {
        samples: Sample[];
    };
    
    let { samples }: Props = $props();
    
    let Plotly: any;
    let selected = $state(0);
    let loading = $state(false);
    let chartElement: HTMLDivElement;

    async function setSelected(index: number) {
        selected = index;
        loading = true;
        
        const url = new URL(window.location.href);
        url.search = `?${samples[index].slug}`;
        window.history.replaceState({}, '', url);
        
        await draw(samples[index].url);
        loading = false;
    }

    async function draw(url: string) {
        const buffer = await fetch(url).then(r => {
            if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`);
            return r.arrayBuffer();
        });
        
        const table = tableFromIPC(buffer);
        
        const x = table.getChild('x')!.toArray();
        const y = table.getChild('y')!.toArray();
        const z = table.getChild('z')!.toArray();
        const c = table.getChild('value')!.toArray();
        const text = table.getChild('token')!.toArray();

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
            x, y, z, text,
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
            scene: { 
                xaxis: { visible: false }, 
                yaxis: { visible: false }, 
                zaxis: { visible: false } 
            },
            showlegend: false
        };

        await Plotly.newPlot(
            chartElement, 
            [trace, origin], 
            layout, 
            { displayModeBar: false, responsive: true }
        );
    }

    onMount(async () => {
        Plotly = (await import('plotly.js-dist-min')).default;
        
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('') || params.keys().next().value;
        
        if (slug) {
            const index = samples.findIndex(s => s.slug === slug);
            if (index !== -1) selected = index;
        }
        
        await draw(samples[selected].url);
    });
</script>

<div role="tablist" class="tabs tabs-box justify-center mb-6">
    {#each samples as sample, i}
        <button
            role="tab"
            class="tab"
            class:tab-active={selected === i}
            onclick={() => setSelected(i)}
        >
            {sample.name}
        </button>
    {/each}
</div>

<div class="card bg-white shadow-md chart-container">
    <div bind:this={chartElement} class:loading></div>
</div>

<style>
    .chart-container {
        height: calc(100dvh - 350px);
        overflow: hidden;
        padding: 0;
        position: relative;
    }
    
    .chart-container > div {
        height: 100%;
        width: 100%;
        transition: filter 0.5s ease, opacity 0.5s ease;
    }

    .chart-container > div.loading {
        filter: blur(4px);
        opacity: 0.5;
        pointer-events: none;
    }

    :global(.hovertext text) {
        font-size: 16px !important;
        font-weight: bold !important;
    }
</style>