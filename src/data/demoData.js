/**
 * demoData.js
 *
 * Generates realistic-looking fake stock price series so the app always
 * has something to show — even when the network is down or the user
 * picks an obscure ticker.
 */

// ── Seeded pseudo-random number generator (Mulberry32) ────────
function mulberry32(seed) {
  return function () {
    /* eslint-disable no-param-reassign */
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    /* eslint-enable no-param-reassign */
  };
}

/**
 * Turn a ticker string into a 32-bit integer seed.
 */
function tickerToSeed(ticker) {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    hash = ((hash << 5) - hash + ticker.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ── Date helpers ──────────────────────────────────────────────
function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function tradingDaysBack(numDays) {
  const dates = [];
  const d = new Date();
  while (dates.length < numDays) {
    d.setDate(d.getDate() - 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(formatDate(new Date(d)));
    }
  }
  return dates.reverse(); // oldest first
}

// ── Core series generator ─────────────────────────────────────

/**
 * Generate a realistic-looking stock price series using
 * geometric Brownian motion (random walk + drift).
 *
 * @param {number}         startPrice  Opening price of the series.
 * @param {number}         endPrice    Approximate target end price (drift target).
 * @param {number}         numPoints   Number of trading days.
 * @param {() => number}   [rng]       Optional PRNG. Falls back to Math.random.
 * @returns {Array<{date: string, price: number}>}
 */
function generateDemoSeries(startPrice, endPrice, numPoints, rng = Math.random) {
  const dates = tradingDaysBack(numPoints);

  // Daily drift needed to reach endPrice from startPrice over numPoints days
  const totalReturn = endPrice / startPrice;
  const dailyDrift  = Math.pow(totalReturn, 1 / numPoints) - 1;

  // Daily volatility — higher for larger total moves
  const annualVol  = 0.25 + Math.abs(totalReturn - 1) * 0.15; // 25-40 % annualised
  const dailyVol   = annualVol / Math.sqrt(252);

  const prices = [startPrice];

  for (let i = 1; i < numPoints; i++) {
    const prev = prices[i - 1];
    // Geometric Brownian step: S(t+1) = S(t) * exp(drift + vol * Z)
    const z    = boxMullerRng(rng);
    const ret  = dailyDrift + dailyVol * z;
    const next = prev * Math.exp(ret);
    prices.push(parseFloat(Math.max(next, 0.01).toFixed(2)));
  }

  return dates.map((date, i) => ({ date, price: prices[i] }));
}

/**
 * Box-Muller using a provided RNG (so we can use seeded randoms).
 */
function boxMullerRng(rng) {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = rng();
  while (u2 === 0) u2 = rng();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

// ── Pre-built demo tickers ────────────────────────────────────
const demoData = {
  NVDA:  generateDemoSeries(100, 800,  250),
  AAPL:  generateDemoSeries(150, 210,  250),
  TSLA:  generateDemoSeries(200, 350,  250),
  MSFT:  generateDemoSeries(280, 420,  250),
  GOOGL: generateDemoSeries(120, 175,  250),
  AMZN:  generateDemoSeries(130, 190,  250),
  META:  generateDemoSeries(300, 520,  250),
  JPM:   generateDemoSeries(140, 210,  250),
  WMT:   generateDemoSeries(140, 180,  250),
  DIS:   generateDemoSeries(90,  110,  250),
};

// ── Public API ────────────────────────────────────────────────

/**
 * Get demo stock data for any ticker.
 *
 * - If the ticker has pre-built data, return the last `days` points.
 * - Otherwise, deterministically generate data on the fly using a
 *   seed derived from the ticker name (so repeated calls for the
 *   same ticker always return the same series).
 *
 * @param {string} ticker  Stock symbol, e.g. "AAPL".
 * @param {number} [days=250]  Number of trailing trading days.
 * @returns {Array<{date: string, price: number}>}
 */
export function getDemoData(ticker, days = 250) {
  const key = ticker.toUpperCase();

  if (demoData[key]) {
    const series = demoData[key];
    return series.slice(-days);
  }

  // Generate on-the-fly with seeded RNG
  const seed = tickerToSeed(key);
  const rng  = mulberry32(seed);

  // Derive a plausible start/end price from the seed
  const startPrice = 20 + (rng() * 400);              // $20 – $420
  const endPrice   = startPrice * (0.5 + rng() * 2);  // 0.5x – 2.5x of start
  const numPoints  = Math.max(days, 50);

  const series = generateDemoSeries(
    parseFloat(startPrice.toFixed(2)),
    parseFloat(endPrice.toFixed(2)),
    numPoints,
    rng,
  );

  // Cache for future calls in this session
  demoData[key] = series;

  return series.slice(-days);
}

export default demoData;
