<script lang="ts">
  import type { Snippet } from "svelte";

  // Rich on-hover popover. The visible trigger is ``children``; the popup body
  // is the ``tip`` snippet. Replaces daisyUI ``tooltip`` (text-only) wherever
  // we want room for a title row, math, code, blurbs, or any formatted content.
  //
  // IMPORTANT: ``children`` MUST be non-interactive (icon, span, label).
  // Wrapping a ``<button>`` or ``<a>`` inside nests two interactive elements
  // (this component's role=button wrapper + the inner clickable). Browser
  // hit-testing under daisyUI's dropdown-hover resolves clicks to the outer
  // wrapper and the inner click is silently absorbed. If a popover is needed
  // on a clickable element, attach it to a sibling info icon.
  //
  //     <HoverCard side="bottom" align="center">
  //       <span>density</span>
  //       {#snippet tip()}
  //         <HoverHeader label="density" code="0.073" />
  //         <Tex tex="..." displayMode />
  //         <p class="text-xs">Hoyer density of the firing values ...</p>
  //       {/snippet}
  //     </HoverCard>
  //
  // Positioning uses Tailwind utilities directly. daisyUI's
  // ``dropdown-top``/``dropdown-bottom`` are technically emitted but their
  // nested-layer + CSS-nesting semantics don't override daisyUI's base rules,
  // so the popup defaults to bottom placement regardless. Plain ``top-full`` /
  // ``bottom-full`` on the absolutely-positioned content wins reliably.
  //
  // The popup wrapper is split from the visible card so the wrapper's
  // ``p-2`` padding bridges the gap between trigger and card — ``:hover``
  // stays continuous as the cursor moves from trigger into the popover.
  let {
    children,
    tip,
    side = "bottom",
    align = "center",
    width = "w-72",
  }: {
    children: Snippet;
    tip: Snippet;
    side?: "top" | "bottom";
    align?: "start" | "center" | "end";
    width?: string;
  } = $props();

  const placement = $derived(side === "top"  ? "bottom-full pb-2" : "top-full pt-2");
  const alignment = $derived(
    align === "start" ? "left-0"
    : align === "end" ? "right-0"
    :                   "left-1/2 -translate-x-1/2",
  );
</script>

<div class="dropdown dropdown-hover cursor-help">
  <div tabindex="0" role="button">{@render children()}</div>
  <div class="dropdown-content {placement} {alignment} z-50 {width}">
    <div class="card card-compact bg-base-100 shadow-xl border border-base-200">
      <div class="card-body !p-4 gap-2">
        {@render tip()}
      </div>
    </div>
  </div>
</div>
