import { clamp, round } from "../utils.js";

/**
 * Computes the Maintainability Index (MI) using the standard formula:
 *
 * MI = 171 - 5.2 * ln(V) - 0.23 * G - 16.2 * ln(LOC)
 *
 * Normalized to 0-100 scale.
 *
 * Where:
 *   V = Halstead Volume
 *   G = Cyclomatic Complexity
 *   LOC = Lines of code (source lines)
 */
export function computeMaintainabilityIndex(
  halsteadVolume: number,
  cyclomaticComplexity: number,
  sourceLoc: number,
): number {
  if (sourceLoc === 0) return 100;

  const lnVolume = halsteadVolume > 0 ? Math.log(halsteadVolume) : 0;
  const lnLoc = Math.log(sourceLoc);

  const mi = 171 - 5.2 * lnVolume - 0.23 * cyclomaticComplexity - 16.2 * lnLoc;

  // Normalize to 0-100
  const normalized = (mi * 100) / 171;

  return round(clamp(normalized, 0, 100));
}
