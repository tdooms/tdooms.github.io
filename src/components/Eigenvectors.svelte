<script lang="ts">
  // Eigenvector browser for the bilinear-MLPs paper: picks one of nine
  // regularization regimes (3 categories × 3 intensities) and one of the top-5
  // positive/negative eigenvectors, then shows the matching pre-rendered SVG
  // from /public/eigenvectors/<model>/<pos|neg><n>.svg. Selection is mirrored
  // into ?model= and ?index= so views are shareable and survive back/forward.
  type ModelType = `${'noise' | 'translate' | 'rotate'}-${'light' | 'medium' | 'strong'}`

  interface Intensity {
    value: 'light' | 'medium' | 'strong'
    label: string
  }

  interface Category {
    label: string
    prefix: 'noise' | 'translate' | 'rotate'
  }

  let index = $state(1)
  let model = $state<ModelType>('noise-strong')

  const isIndexActive = (num: number): boolean => index === num
  const isModelActive = (category: Category, intensity: Intensity): boolean =>
    model === `${category.prefix}-${intensity.value}`

  const updateURL = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('model', model)
    url.searchParams.set('index', index.toString())
    window.history.pushState({}, '', url)
  }

  const setIndex = (i: number) => {
    index = i
    updateURL()
  }

  const setModel = (category: Category, intensity: Intensity) => {
    model = `${category.prefix}-${intensity.value}` as ModelType
    updateURL()
  }

  const intensities: Intensity[] = [
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'strong', label: 'Strong' },
  ]

  const categories: Category[] = [
    { label: 'Input Noise', prefix: 'noise' },
    { label: 'Translation', prefix: 'translate' },
    { label: 'Rotation', prefix: 'rotate' },
  ]

  // Every valid `?model=` value — used to reject malformed URLs instead of
  // casting blindly (a bad value would point the <img> at a 404).
  const validModels: string[] = categories.flatMap((c) =>
    intensities.map((i) => `${c.prefix}-${i.value}`),
  )

  const syncFromURL = () => {
    const params = new URLSearchParams(window.location.search)
    const urlIndex = params.get('index')
    const urlModel = params.get('model')
    if (urlIndex) {
      const parsed = parseInt(urlIndex, 10)
      // Valid indices are ±1..±5 (sign picks positive vs negative spectrum).
      if (Number.isInteger(parsed) && parsed !== 0 && Math.abs(parsed) <= 5) index = parsed
    }
    if (urlModel && validModels.includes(urlModel)) model = urlModel as ModelType
  }

  $effect(() => {
    syncFromURL()
    window.addEventListener('popstate', syncFromURL)
    return () => window.removeEventListener('popstate', syncFromURL)
  })
</script>

<div class="flex gap-6">
  <ul class="menu bg-base-100 shadow-md rounded-box w-56 shrink-0 gap-1 p-4">
    {#each categories as category (category.prefix)}
      <li class="menu-title">
        <span>{category.label}</span>
      </li>
      {#each intensities as intensity (intensity.value)}
        <li>
          <button
            type="button"
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
    <div class="mb-6 flex flex-wrap items-center justify-center gap-6">
      <h3 class="text-xl font-bold">Positive</h3>
      <div class="tabs tabs-box">
        {#each [1, 2, 3, 4, 5] as i (i)}
          <button
            type="button"
            class="tab"
            class:tab-active={isIndexActive(i)}
            aria-pressed={isIndexActive(i)}
            onclick={() => setIndex(i)}
          >
            {i}
          </button>
        {/each}
      </div>
      <div class="tabs tabs-box">
        {#each [5, 4, 3, 2, 1] as i (`neg-${i}`)}
          <button
            type="button"
            class="tab"
            class:tab-active={isIndexActive(-i)}
            aria-pressed={isIndexActive(-i)}
            onclick={() => setIndex(-i)}
          >
            {i}
          </button>
        {/each}
      </div>
      <h3 class="text-xl font-bold">Negative</h3>
    </div>

    <div class="card bg-base-100 p-6 shadow-md">
      <img
        src={`/eigenvectors/${model}/${index > 0 ? 'pos' : 'neg'}${Math.abs(index)}.svg`}
        alt={`Eigenvector ${model} index ${index}`}
        class="w-full"
      />
    </div>
  </div>
</div>
