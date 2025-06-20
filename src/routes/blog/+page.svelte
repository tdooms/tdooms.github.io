<script lang="ts">
    import Card from "$lib/card.svelte";

    const blogs = [
        {
            title: "A gentle introduction to tensor networks",
            date: "20 Jun 2025",
            image: "blogs/tensornetworks.png",
            location: "blog/tensors"
        },
        {
            title: "Interpretability and the human body",
            date: "17 Jan 2024",
            image: "blogs/medicine.png",
            location: "blog/medicine"
        },
        {
            title: "Reflecting on deep learning questions",
            date: "11 Jan 2024",
            image: "blogs/questions.png",
            location: "blog/questions"
        }
    ]
</script>

<div class="columns is-multiline">
    {#each blogs as blog}
        <div class="column is-4">
            <Card {...blog} />
        </div>
    {/each}
</div>
