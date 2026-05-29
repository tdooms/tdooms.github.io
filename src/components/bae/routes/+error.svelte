<script>
  import { base } from "$app/paths";
  import { page } from "$app/state";
</script>

<svelte:head><title>bae · error</title></svelte:head>

<div class="flex flex-col items-center justify-center h-full gap-6 px-8 text-center">
  <h1 class="text-2xl font-semibold tracking-tight">{page.status} — something went wrong</h1>
  <pre class="font-mono text-sm text-error/85 bg-base-200 px-4 py-3 rounded max-w-2xl whitespace-pre-wrap break-all">{page.error?.message ?? "no error message"}</pre>
  <a href="{base}/" class="btn btn-sm btn-primary">back to overview</a>
</div>
