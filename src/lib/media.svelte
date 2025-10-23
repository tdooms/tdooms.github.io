<script lang="ts">
    interface Props {
        icon: string;
        title: string;
        date: string;
        children: any;
    }

    let { icon, title, date, children }: Props = $props();
</script>

<div class="box">
    <div class="media">
        <div class="media-left">
            <figure class="image is-48x48">
                <img src={icon} alt="icon" />
            </figure>
        </div>
        <div class="media-content">
            <h5 class="title is-5 mb-0"> {title} </h5>
            <h6> {date} </h6>
        </div>
    </div>
    {@render children()}
</div>