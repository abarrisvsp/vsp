// lib/color.ts
/**
 * Returns true if the given hex color is perceptually light (luminance > 128).
 * Uses ITU-R BT.601 weighting coefficients.
 * Output is always safe — invalid hex returns false (treat as dark).
 */
export function isLight(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
