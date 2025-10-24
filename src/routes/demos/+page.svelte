<script>
    import Card from "$lib/card.svelte";

    import demos from "$data/demos.json";
</script>

<div class="columns is-multiline">
    {#each demos as demo}
        <div class="column is-4">
            <Card {...demo} square={true} />
        </div>
    {/each}
</div>