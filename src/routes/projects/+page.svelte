<script lang="ts">
    import Project from "$lib/project.svelte";
    import projects from "$data/projects.json";
</script>


<div class="fixed-grid is-centered">
    <div class="grid has-2-cols">
        {#each projects as project}
            <Project {...project} />
        {/each}   
    </div>
</div>

