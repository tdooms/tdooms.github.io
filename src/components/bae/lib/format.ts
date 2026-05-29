// Adaptive number formatters used in tooltips, chart labels, and stats. The
// precision tiers exist because a research dashboard mixes scales: an
// importance reads 5×, a density reads 0.073, a tail eigenvalue reads 8e-4.

/** Sign-aware decimal: ≥10 → 0 dp, ≥1 → 1 dp, ≥0.01 → 2 dp, else exponential. */
export const adaptive = (n: number): string => {
  const a = Math.abs(n);
  if (a >= 10)   return n.toFixed(0);
  if (a >= 1)    return n.toFixed(1);
  if (a >= 0.01) return n.toFixed(2);
  return n.toExponential(1);
};

/** Fraction → percent string with adaptive precision (0.0734 → "7.3%"). */
export const percent = (fraction: number): string => {
  const p = fraction * 100;
  if (p >= 100) return `${p.toFixed(0)}%`;
  if (p >= 1)   return `${p.toFixed(1)}%`;
  return `${p.toFixed(2)}%`;
};

/** Compact integer with k/M suffix for axis labels — 12500 → "13k", 2_300_000 → "2M". */
export const compact = (n: number): string => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}k`;
  return n.toFixed(0);
};
