<script module lang="ts">
  // Share the in-flight load too: WebKit can request it once per equation otherwise.
  let renderer: Promise<typeof import('katex')> | undefined
</script>

<script lang="ts">
  // Equations occur only in composite details; keep KaTeX out of the overview load.
  const katex = (renderer ??= import('katex'))

  // CONTRACT: pass ``tex`` as a JS expression, not a bare attribute string. Svelte's
  // template parser treats ``{...}`` inside attribute strings as expression interpolation,
  // so ``<Math tex="\mathrm{feats}" />`` crashes with "feats is not defined". Use one of:
  //
  //     <Math tex={String.raw`\mathrm{feats}`} />
  //     <Math tex={"\\mathrm{feats}"} />
  //     // or define `const t = String.raw`...`;` in <script> and pass `tex={t}`.
  let { tex, displayMode = false }: { tex: string; displayMode?: boolean } = $props()
</script>

{#await katex}
  <span class="font-mono break-all">{tex}</span>
{:then katex}
  <span>
    {@html katex.default.renderToString(tex, {
      displayMode,
      throwOnError: false,
      output: 'htmlAndMathml',
    })}
  </span>
{:catch}
  <span class="font-mono break-all" title="Math formatting is unavailable">{tex}</span>
{/await}
