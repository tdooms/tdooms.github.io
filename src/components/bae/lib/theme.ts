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

export const theme = (): Theme => {
  const baseContent = cssVar("base-content");
  return {
    primary:     cssVar("primary"),
    base100:     cssVar("base-100"),
    base200:     cssVar("base-200"),
    base300:     cssVar("base-300"),
    baseContent,
    error:       cssVar("error"),
    warning:     cssVar("warning"),
    softPink:    "#fbcfe8",
    muted:       toHex(`color-mix(in oklch, ${baseContent} 55%, white)`),
    faint:       toHex(`color-mix(in oklch, ${baseContent} 35%, white)`),
  };
};
