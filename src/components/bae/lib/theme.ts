// Convert any CSS colour string daisyUI emits (oklch, color-mix, …) into a
// `#rrggbb` hex by rasterising one pixel and reading the bytes back. Forces
// the browser through its sRGB pixel pipeline, which guarantees a numeric
// RGB result no matter how Chromium chooses to serialise computed styles.
import type { Theme } from "./types";

let _ctx: CanvasRenderingContext2D | null = null;
const hex = (n: number) => Math.round(n).toString(16).padStart(2, "0");

const toHex = (css: string): string => {
  if (!_ctx) {
    _ctx = document.createElement("canvas")
      .getContext("2d", { willReadFrequently: true });
  }
  _ctx!.fillStyle = "#fff";                                                  // fallback if css is invalid
  _ctx!.fillRect(0, 0, 1, 1);
  _ctx!.fillStyle = css;
  _ctx!.fillRect(0, 0, 1, 1);
  const [r, g, b] = _ctx!.getImageData(0, 0, 1, 1).data;
  return `#${hex(r)}${hex(g)}${hex(b)}`;
};

const cssVar = (name: string): string =>
  toHex(getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${name}`).trim());

// Linear-sRGB mix of two CSS colours → "#rrggbb" (``t`` = fraction of ``a``).
// The manifold shader and TopActivations both interpolate toward the neutral in
// linear RGB; charts call this to colour marks on that exact same ramp.
export const mixLinear = (a: string, b: string, t: number): string =>
  toHex(`color-mix(in srgb-linear, ${a} ${Math.round(t * 100)}%, ${b})`);

export const theme = (): Theme => {
  const baseContent = cssVar("base-content");
  const primary = cssVar("primary");
  const secondary = cssVar("secondary");
  const base100 = cssVar("base-100");
  const base300 = cssVar("base-300");
  return {
    primary,
    secondary,
    base100,
    base200:     cssVar("base-200"),
    base300,
    baseContent,
    error:       cssVar("error"),
    warning:     cssVar("warning"),
    // Pale tint of the brand orange — the low end of the sequential rank ramp,
    // so the UMAP fades pale-orange → orange instead of the old pink → orange.
    // Mix from already-resolved hexes: canvas fillStyle can't resolve `var()`,
    // so a var()-based color-mix here would silently fall back to white.
    primarySoft: toHex(`color-mix(in oklch, ${primary} 18%, ${base100})`),
    muted:       toHex(`color-mix(in oklch, ${baseContent} 55%, white)`),
    faint:       toHex(`color-mix(in oklch, ${baseContent} 35%, white)`),
  };
};
