<script lang="ts">
    import { copy } from 'svelte-copy';

    let { bib }: { bib: string } = $props();
</script>

<div class="card is-hidden-mobile">
    <header class="card-header has-background-grey-light">
        <p class="card-header-title mb-0">How to cite</p>
        <button class="card-header-icon" aria-label="more options">
            <span class="icon">
                <i class="fa-solid fa-copy" aria-hidden="true" use:copy={bib}></i>
            </span>
        </button>
    </header>
    <small>
    <pre class="card-content" id="cite-slot">{bib}</pre>
    </small>
</div>