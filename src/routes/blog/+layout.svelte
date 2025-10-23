<script lang="ts">
    import Navbar from "$lib/navbar.svelte";
    const { children } = $props();
</script>

<Navbar page="blog"/>
{@render children()}