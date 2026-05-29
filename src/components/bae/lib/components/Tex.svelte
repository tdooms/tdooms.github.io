<script>
  import katex from "katex";
  import "katex/dist/katex.min.css";

  // CONTRACT: pass ``tex`` as a JS expression, not a bare attribute string. Svelte's
  // template parser treats ``{...}`` inside attribute strings as expression interpolation,
  // so ``<Math tex="\mathrm{feats}" />`` crashes with "feats is not defined". Use one of:
  //
  //     <Math tex={String.raw`\mathrm{feats}`} />
  //     <Math tex={"\\mathrm{feats}"} />
  //     // or define `const t = String.raw`...`;` in <script> and pass `tex={t}`.
  let { tex, displayMode = false } = $props();
  let el;

  $effect(() => {
    if (!el) return;
    katex.render(tex, el, { displayMode, throwOnError: false, output: "html" });
  });
</script>

<span bind:this={el}></span>
