<script lang="ts">
    interface Props {
        title: string;
        sub: string;
        image: string;
        url: string;
        square?: boolean;
    }

    let { title, sub, image, url, square = false }: Props = $props();
</script>

<style>
    .card .card-image img {
        filter: grayscale(0.75);
        transition: filter 0.3s ease-in-out;
    }

    .card:hover .card-image img {
        filter: grayscale(0);
    }

    .card {
        transition: transform 0.3s ease-in-out;
    }
    .card:hover {
        transform: scale(1.02);
    }
</style>

<a href={url}>
<div class="card">
    <div class="card-image">
        <figure class={"image " + (square ? "is-square" : "is-3by2")}>
        <img src={image} alt="Placeholder" style="object-fit: cover;">
        </figure>
    </div>
    <div class="card-content">
        <h4 class="title is-4 mb-2"> {title} </h4>
        <div class="content"> {sub} </div>
    </div>
</div>
</a>