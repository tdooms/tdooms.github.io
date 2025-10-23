<script>
    import { afterNavigate } from '$app/navigation';
    const { children } = $props();

    afterNavigate((navigation) => {
        gtag('event', 'page_view', {
            page_path: navigation.to.url.pathname,
        });
    });
</script>

<main class="container is-max-desktop">
    <div class="p-1 mt-5">
    {@render children()}
    </div>
</main>