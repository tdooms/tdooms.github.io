<script lang="ts">
    import Box from "$lib/box.svelte";

    import papers from "$data/papers.json";
    import posts from "$data/posts.json";
    import presentations from "$data/presentations.json";
</script>


<h5 class="title is-5 ml-2 mt-1"> Papers </h5>
{#each papers as paper}
    <Box {...paper} />
{/each}

<h5 class="title is-5 ml-2 mt-6"> Posts </h5>
{#each posts as post}
    <Box {...post} />
{/each}

<h5 class="title is-5 ml-2 mt-6"> Presentations </h5>
{#each presentations as presentation}
    <Box {...presentation} />
{/each}


<div class="mb-6"></div>