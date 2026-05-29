<script lang="ts">
  // One token in a context strip. ``active`` paints the firing token with a
  // diverging tint (primary if ``positive``, error otherwise); inactive
  // tokens are dimmed so the eye lands on the firing site.
  //
  // The /15 alpha sits between Tailwind's /10 and /20 — a deliberate notch
  // less saturated than the chrome's /20 hover backgrounds.
  let {
    token,
    active = false,
    positive = true,
  }: {
    token: string;
    active?: boolean;
    positive?: boolean;
  } = $props();
</script>

{#if active}
  <span class="font-semibold rounded-sm px-0.5
               {positive ? 'bg-primary/15 text-primary' : 'bg-error/15 text-error'}">{token}</span>
{:else}
  <span class="text-base-content/65">{token}</span>
{/if}
