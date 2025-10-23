<script lang="ts">
    import Card from "$lib/card.svelte";
    import blogs from "$data/blogs.json";
</script>

<div class="columns is-multiline">
    {#each blogs as blog}
        <div class="column is-4">
            <Card {...blog} />
        </div>
    {/each}
</div>
