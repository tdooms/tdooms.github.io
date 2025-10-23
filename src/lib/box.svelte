<script lang="ts">
    interface Props {
        title: string;
        date: string;
        published: string;
        description: string;
        link: string;
        external?: boolean;
    }

    let { title, date, published, description, link, external = false }: Props = $props();
</script>

<style>
    .box {
        transition: transform 0.3s ease-in-out;
    }
    .box:hover {
        transform: scale(1.02);
    }
</style>

<a class="box" href={link} target="{external ? '_blank' : '_self'}">
    <div class="columns mb-0">
        <div class="column">
            <h5 class="title is-5 mb-0"> {title} </h5>
        </div>
        <div class="column is-narrow is-hidden-mobile" style="text-align:right">
            <b class="title is-6 mb-0"> {published} </b>
            <small style="display: inline"> ({date}) </small>
        </div>
    </div>
    

    <p> {description} </p>
</a>