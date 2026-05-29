<script lang="ts">
  // Title row that opens every HoverCard tip body — uppercase tracking-wider
  // label on the left, monospace code/value on the right. Single source of
  // truth for that pairing's typography (truncate, weights, alpha steps), so
  // the model breadcrumb / AE breadcrumb / metric tip / keyboard popover all
  // line up exactly.
  let { label, code }: { label: string; code: string } = $props();
</script>

<div class="flex items-baseline justify-between gap-2">
  <span class="text-xs uppercase tracking-wider text-base-content/70 font-semibold">{label}</span>
  <code class="text-xs font-mono text-primary tabular-nums truncate">{code}</code>
</div>
