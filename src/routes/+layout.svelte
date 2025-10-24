<script>
    import { afterNavigate } from '$app/navigation';
    const { children } = $props();

    afterNavigate((navigation) => {
        gtag('event', 'page_view', {
            page_path: navigation.to.url.pathname,
        });
    });
</script>

<main class="container is-max-desktop px-2">
    <div class="mt-5">
    {@render children()}
    </div>
</main>