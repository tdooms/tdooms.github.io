<script lang="ts">
  // Title row that opens every HoverCard tip body — uppercase tracking-wider
  // label on the left, monospace code/value on the right. Single source of
  // truth for that pairing's typography (truncate, weights, alpha steps), so
  // the model breadcrumb / AE breadcrumb / metric tip / keyboard popover all
  // line up exactly.
  let { label, code }: { label: string; code: string } = $props()
</script>

<div class="flex items-baseline justify-between gap-2">
  <span class="text-base-content/70 text-xs font-semibold tracking-wider uppercase">{label}</span>
  <code class="text-primary truncate font-mono text-xs tabular-nums">{code}</code>
</div>
