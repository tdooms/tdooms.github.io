<script lang="ts">
    import { onMount } from 'svelte';

    type ModelType = `${'noise' | 'translate' | 'rotate'}-${'light' | 'medium' | 'strong'}`;
    
    let index = $state(1);
    let model = $state<ModelType>("noise-strong");

    const isIndexActive = (num: number): boolean => index === num;
    const isModelActive = (category: Category, intensity: Intensity): boolean => 
        model === `${category.prefix}-${intensity.value}`;

    const setIndex = (i: number) => {
        index = i;
        updateURL();
    };

    const setModel = (category: Category, intensity: Intensity) => {
        model = `${category.prefix}-${intensity.value}` as ModelType;
        updateURL();
    };

    const updateURL = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('model', model);
        url.searchParams.set('index', index.toString());
        window.history.pushState({}, '', url);
    };

    interface Intensity {
        value: 'light' | 'medium' | 'strong';
        label: string;
    }

    interface Category {
        label: string;
        prefix: 'noise' | 'translate' | 'rotate';
    }

    const intensities: Intensity[] = [
        { value: 'light', label: 'Light' },
        { value: 'medium', label: 'Medium' },
        { value: 'strong', label: 'Strong' },
    ];

    const categories: Category[] = [
        { label: 'Input Noise', prefix: 'noise' },
        { label: 'Translation', prefix: 'translate' },
        { label: 'Rotation', prefix: 'rotate' }
    ];

    onMount(() => {
        // Read initial params from URL
        const params = new URLSearchParams(window.location.search);
        const urlIndex = params.get('index');
        const urlModel = params.get('model');
        
        if (urlIndex) index = parseInt(urlIndex);
        if (urlModel) model = urlModel as ModelType;

        // Handle back/forward navigation
        window.addEventListener('popstate', () => {
            const params = new URLSearchParams(window.location.search);
            const urlIndex = params.get('index');
            const urlModel = params.get('model');
            
            if (urlIndex) index = parseInt(urlIndex);
            if (urlModel) model = urlModel as ModelType;
        });
    });
</script>

<div class="flex gap-6">
    <ul class="menu bg-white shadow-md rounded-box p-4 gap-1 w-56 shrink-0">
        {#each categories as category}
            <li class="menu-title">
                <span>{category.label}</span>
            </li>
            {#each intensities as intensity}
                <li>
                    <button
                        class:menu-active={isModelActive(category, intensity)}
                        onclick={() => setModel(category, intensity)}
                    >
                        {intensity.label}
                    </button>
                </li>
            {/each}
        {/each}
    </ul>

    <div class="flex-1">
        <div class="flex items-center justify-center gap-6 mb-6 flex-wrap">
            <h4 class="text-xl font-bold">Positive</h4>
            <div role="tablist" class="tabs tabs-box">
                {#each [1, 2, 3, 4, 5] as i}
                    <button
                        role="tab"
                        class="tab"
                        class:tab-active={isIndexActive(i)}
                        onclick={() => setIndex(i)}
                    >
                        {i}
                    </button>
                {/each}
            </div>
            <div role="tablist" class="tabs tabs-box">
                {#each [5, 4, 3, 2, 1] as i}
                    <button
                        role="tab"
                        class="tab"
                        class:tab-active={isIndexActive(-i)}
                        onclick={() => setIndex(-i)}
                    >
                        {i}
                    </button>
                {/each}
            </div>
            <h4 class="text-xl font-bold">Negative</h4>
        </div>

        <div class="card bg-white shadow-md p-6">
            <img src={`/eigenvectors/${model}/${index > 0 ? 'pos' : 'neg'}${Math.abs(index)}.svg`} alt={`Eigenvector ${model} index ${index}`} class="w-full" />
        </div>
    </div>
</div>