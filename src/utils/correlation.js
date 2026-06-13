/**
 * correlation.js
 *
 * Pearson correlation coefficient + deadpan verdict labels.
 * The correlation is computed on the two *aligned* value arrays.
 * Because Pearson's r is invariant under linear scaling, it doesn't
 * matter whether we pass raw values or the 0–100 normalized versions —
 * the result is identical.
 */

/**
 * Pearson product-moment correlation coefficient.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} r in [-1, 1]; returns 0 when undefined (no variance / mismatched length)
 */
export function pearson(a, b) {
  const n = Math.min(a?.length || 0, b?.length || 0);
  if (n < 2) return 0;

  let sumA = 0;
  let sumB = 0;
  for (let i = 0; i < n; i++) {
    sumA += a[i];
    sumB += b[i];
  }
  const meanA = sumA / n;
  const meanB = sumB / n;

  let cov = 0;
  let varA = 0;
  let varB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }

  const denom = Math.sqrt(varA * varB);
  if (denom === 0) return 0; // a flat line has no correlation to anything

  const r = cov / denom;
  // Guard against tiny floating-point overshoots beyond ±1
  return Math.max(-1, Math.min(1, r));
}

/**
 * Maps a correlation coefficient to a deadpan verdict.
 * Thresholds are based on the *absolute* value of r so strong negative
 * correlations are treated as just as suspicious as strong positive ones.
 *
 * @param {number} r
 * @returns {{ label: string, tier: 'high' | 'medium' | 'low' }}
 */
export function correlationVerdict(r) {
  const abs = Math.abs(r);

  if (abs > 0.8) {
    return { label: "Your broker doesn't want you to see this.", tier: 'high' };
  }
  if (abs >= 0.5) {
    return { label: 'Statistically suspicious.', tier: 'medium' };
  }
  return { label: 'Weakly correlated, like most relationships.', tier: 'low' };
}
