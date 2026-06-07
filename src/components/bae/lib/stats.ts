// Per-composite stats, formatted for display. The chrome (InfoBar) calls
// these and renders the strings; no arithmetic in the chrome itself.
import type { Composite } from "./types";

/**
 * Four pre-formatted stats sourced from the global index (no per-composite
 * JSON read needed). ``totalComposites`` re-normalises ``importance`` so the
 * population mean reads 1× — Python ships values that sum to 1.
 *
 * Every readout is fixed to exactly two decimals for a uniform stat bar
 * (``0.90`` not ``0.9``). Importance uses a fixed format rather than the
 * adaptive formatter, whose scientific-notation fallback for values <0.01
 * (``8e-3×``) is noisier than useful here; small values just round to
 * ``0.00×``.
 */
export const compositeStats = (c: Composite, totalComposites: number) => ({
  density:    c.density.toFixed(2),
  rank:       c.rank.toFixed(2),
  support:    c.support,
  importance: `${(c.importance * totalComposites).toFixed(2)}×`,
});

/**
 * Fraction of the composite's bilinear weight captured by the top three
 * eigenvectors — i.e. the three directions shown in the 3D scatter. ``"63%"``
 * means the rest of the spectrum carries the remaining 37%.
 */
export const captured = (eigvals: number[]): string => {
  const abs = eigvals.map(Math.abs).sort((a, b) => b - a);
  const total = abs.reduce((s, v) => s + v, 0);
  return `${(((abs[0] + abs[1] + abs[2]) / total) * 100).toFixed(0)}%`;
};

/**
 * Top-``n`` eigenvalues by |λ|, normalised so the largest absolute bar is 1
 * and returned in *signed-ascending* order — the spectrum chart renders
 * symmetrically (negative bars below 0, positive above) and every bar's
 * height stays meaningful even when one direction dominates the spectrum.
 * ``labels[i]`` is ``"X" | "Y" | "Z"`` if bar ``i`` corresponds to the
 * manifold scene's k-th axis (k = top-``k`` by |λ|), else ``null``.
 */
export const topSpectrum = (
  eigvals: number[], n = 32, k = 3,
): { values: number[]; labels: (string | null)[] } => {
  const indexed = eigvals.map((v, i) => [v, i] as const);
  indexed.sort((a, b) => Math.abs(b[0]) - Math.abs(a[0]));
  const top = indexed.slice(0, n).sort((a, b) => a[0] - b[0]);
  const axisIdx = indexed.slice(0, k).map(([, i]) => i);
  const norm = Math.max(...top.map(([v]) => Math.abs(v)), 1e-12);
  const tag = "XYZ";
  return {
    values: top.map(([v]) => v / norm),
    labels: top.map(([, i]) => {
      const j = axisIdx.indexOf(i);
      return j >= 0 ? tag[j] : null;
    }),
  };
};
