<script lang="ts">
  import type { Snippet } from "svelte";
  import HoverHeader from "./HoverHeader.svelte";
  import Tex from "./Tex.svelte";

  // Body of a HoverCard tip describing a single metric. Three rows:
  //   1. label / value title row (always)
  //   2. TeX equation in a primary-tinted box (optional)
  //   3. plain-language blurb passed as children — supports markup
  //      (``<sub>`` / ``<sup>`` etc. in some equation explanations).
  //
  // The /8 alpha on the equation box is below Tailwind's standard scale; it
  // gives the lightest-possible primary wash without competing with the text.
  let {
    label,
    value,
    tex = null,
    children,
  }: {
    label: string;
    value: string;
    tex?: string | null;
    children: Snippet;
  } = $props();
</script>

<HoverHeader {label} code={value} />
{#if tex}
  <div class="text-primary bg-primary/8 rounded px-2 py-1.5 leading-relaxed text-center">
    <Tex {tex} displayMode />
  </div>
{/if}
<p class="text-xs text-base-content/70 leading-relaxed">{@render children()}</p>
