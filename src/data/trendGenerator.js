/**
 * trendGenerator.js
 *
 * Takes real (or demo) stock price data and produces a fake "absurd dataset"
 * trend that visually mirrors the stock chart — with just enough noise to
 * look like a legitimately suspicious coincidence.
 */

// ── Gaussian noise (Box-Muller transform) ─────────────────────
function gaussianRandom(mean = 0, stdev = 1) {
  let u1 = 0;
  let u2 = 0;
  // Avoid log(0)
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z * stdev + mean;
}

/**
 * Generate an absurd-dataset trend that mirrors a stock price series.
 *
 * @param {Array<{date: string, price: number}>} stockPrices
 *   Chronologically-ordered stock data points.
 * @param {{baseMin: number, baseMax: number}} dataset
 *   The absurd dataset definition — we scale into [baseMin, baseMax].
 * @param {object} [options]
 * @param {number} [options.noiseLevel=0.05]  Fraction of noise (0–1). Default 5 %.
 * @param {number} [options.maxShift=0.12]    Max vertical offset as fraction of range.
 * @param {boolean}[options.invertChance=false] If true, 15 % chance of inverting the curve.
 * @returns {Array<{date: string, value: number}>}
 */
export function generateAbsurdTrend(stockPrices, dataset, options = {}) {
  const {
    noiseLevel = 0.05,
    maxShift   = 0.12,
    invertChance = false,
  } = options;

  if (!stockPrices || stockPrices.length === 0) return [];

  // 1. Extract raw prices
  const prices = stockPrices.map((p) => p.price);

  // 2. Normalise to 0–1
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1; // avoid division by zero

  let normalised = prices.map((p) => (p - min) / range);

  // 3. Optionally invert the curve (rare, keeps things spicy)
  if (invertChance && Math.random() < 0.15) {
    normalised = normalised.map((v) => 1 - v);
  }

  // 4. Add per-point Gaussian noise (±noiseLevel)
  const noisy = normalised.map((v) => {
    const jitter = gaussianRandom(0, noiseLevel);
    return v + jitter;
  });

  // 5. Apply a slight random vertical offset (shift entire curve)
  const shift = gaussianRandom(0, maxShift / 2);
  const shifted = noisy.map((v) => v + shift);

  // 6. Smooth with a tiny moving-average to avoid jagged artifacts
  const smoothed = simpleSmooth(shifted, 3);

  // 7. Re-clamp to 0–1 after noise/shift so we can scale cleanly
  const sMin = Math.min(...smoothed);
  const sMax = Math.max(...smoothed);
  const sRange = sMax - sMin || 1;
  const clamped = smoothed.map((v) => (v - sMin) / sRange);

  // 8. Scale into the dataset's baseMin–baseMax range
  const { baseMin, baseMax } = dataset;
  const dataRange = baseMax - baseMin;

  return stockPrices.map((point, i) => ({
    date:  point.date,
    value: parseFloat((clamped[i] * dataRange + baseMin).toFixed(2)),
  }));
}

// ── Helpers ───────────────────────────────────────────────────

/**
 * Simple centred moving-average smoother.
 * @param {number[]} data
 * @param {number}   windowSize  Must be odd. Defaults to 3.
 * @returns {number[]}
 */
function simpleSmooth(data, windowSize = 3) {
  const half = Math.floor(windowSize / 2);
  return data.map((_, i) => {
    let sum = 0;
    let count = 0;
    for (let j = i - half; j <= i + half; j++) {
      if (j >= 0 && j < data.length) {
        sum += data[j];
        count++;
      }
    }
    return sum / count;
  });
}
