<script lang="ts">
    export let title;
    export let back;
</script>

<div class="content has-text-justified" style="margin: 0 auto;max-width: 880px;">
    <h3 class="title is-3 mb-2">{ title }</h3>

    <slot />

    <div class="buttons is-centered mt-5">
        <a class="button is-primary" href="/{back}">Back</a>
    </div>
    <div class="mb-6" />
</div>