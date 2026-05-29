<script lang="ts">
  import type { PointsData } from "../types";
  import TokenChip from "./TokenChip.svelte";

  // Two stacks: top-N firing positive (primary) and top-N firing negative
  // (error). Mirrors the diverging colormap on the 3D scatter — color-mix in
  // srgb-linear matches the shader's linear-RGB interpolation toward the
  // base-300 neutral, so low |activation| values fade to gray exactly like the
  // dots.
  let { points, top = 6 }: { points: PointsData; top?: number } = $props();

  let split = $derived.by(() => {
    const { activation, context, contextLength, vocab } = points;
    const n = activation.length;
    const idx = Array.from({ length: n }, (_, i) => i);
    const positive = idx.filter((i) => activation[i] > 0)
      .sort((a, b) => activation[b] - activation[a]).slice(0, top);
    const negative = idx.filter((i) => activation[i] < 0)
      .sort((a, b) => activation[a] - activation[b]).slice(0, top);
    const centre = contextLength >> 1;

    const maxAbs = Math.max(
      ...positive.map((i) => activation[i]),
      ...negative.map((i) => -activation[i]),
      1e-12,
    );

    const row = (i: number) => {
      const tokens = new Array<string>(contextLength);
      for (let j = 0; j < contextLength; j++) tokens[j] = vocab[context[i * contextLength + j]];
      return { tokens, centre, value: activation[i], intensity: Math.abs(activation[i]) / maxAbs };
    };
    return { positive: positive.map(row), negative: negative.map(row) };
  });

  const fmt = (v: number) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(2);
  const mix = (tone: string, intensity: number) =>
    `color-mix(in srgb-linear, var(--color-${tone}) ${Math.round(intensity * 100)}%, var(--color-base-300))`;
</script>

<div class="flex flex-col gap-3 overflow-y-auto">
  {#each [{ rows: split.positive, tone: "primary" }, { rows: split.negative, tone: "error" }] as { rows, tone }}
    {#if rows.length}
      <section class="flex flex-col">
        <ul class="flex flex-col font-mono text-xs">
          {#each rows as row}
            <li class="py-1 truncate hover:bg-base-200 rounded-sm flex items-baseline gap-2">
              <span
                class="tabular-nums shrink-0 w-12 text-right font-semibold"
                style="color: {mix(tone, row.intensity)}"
              >{fmt(row.value)}</span>
              <span class="truncate flex-1">
                {#each row.tokens as t, i}<TokenChip token={t}
                    active={i === row.centre} positive={tone === "primary"} />{/each}
              </span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  {/each}
</div>
