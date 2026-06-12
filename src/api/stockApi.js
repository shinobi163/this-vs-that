import { getDemoData } from '../data/demoData';

// ─── Configuration ───────────────────────────────────────────────
// Replace 'demo' with a real Alpha Vantage API key for live data.
// Get a free key at: https://www.alphavantage.co/support/#api-key
const API_KEY = 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Fetches historical stock price data for a given ticker.
 *
 * Strategy:
 *   1. If API_KEY is 'demo', skip the network call and use demo data.
 *   2. For ranges ≤ 100 trading days → TIME_SERIES_DAILY (compact, last 100 points).
 *   3. For ranges > 100 days → TIME_SERIES_WEEKLY_ADJUSTED (covers decades of data).
 *   4. On any error (network, rate-limit, bad response) → fall back to getDemoData().
 *
 * @param {string} ticker  - Stock ticker symbol, e.g. 'AAPL'
 * @param {number} days    - Number of calendar days of history requested
 * @returns {Promise<Array<{date: string, price: number}>>} sorted ascending by date
 */
export async function fetchStockData(ticker, days) {
  // Skip network entirely when running with the default demo key
  if (API_KEY === 'demo') {
    return getDemoData(ticker, days);
  }

  try {
    const params = buildRequestParams(ticker, days);
    const url = `${BASE_URL}?${new URLSearchParams(params).toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    // Alpha Vantage returns an error note when rate-limited or key is invalid
    if (json['Error Message'] || json['Note'] || json['Information']) {
      console.warn('[stockApi] API returned an error/note, falling back to demo data:', json);
      return getDemoData(ticker, days);
    }

    const parsed = parseTimeSeries(json, days);

    // Sanity check — if parsing yielded nothing useful, fall back
    if (!parsed || parsed.length === 0) {
      console.warn('[stockApi] Parsed data is empty, falling back to demo data.');
      return getDemoData(ticker, days);
    }

    return parsed;
  } catch (error) {
    console.error('[stockApi] Fetch failed, falling back to demo data:', error.message);
    return getDemoData(ticker, days);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Builds the query parameters object for the Alpha Vantage request.
 */
function buildRequestParams(ticker, days) {
  // For short ranges, daily compact is plenty (last ~100 trading days)
  if (days <= 100) {
    return {
      function: 'TIME_SERIES_DAILY',
      symbol: ticker,
      outputsize: 'compact',
      apikey: API_KEY,
    };
  }

  // For longer ranges, weekly adjusted gives us decades of data efficiently
  if (days > 730) {
    return {
      function: 'TIME_SERIES_WEEKLY_ADJUSTED',
      symbol: ticker,
      apikey: API_KEY,
    };
  }

  // Medium ranges: full daily output
  return {
    function: 'TIME_SERIES_DAILY',
    symbol: ticker,
    outputsize: 'full',
    apikey: API_KEY,
  };
}

/**
 * Parses the raw Alpha Vantage JSON into our standard format.
 * Handles both daily and weekly response shapes.
 *
 * @returns {Array<{date: string, price: number}>} sorted ascending by date
 */
function parseTimeSeries(json, days) {
  // Determine which key holds the time series data
  const seriesKey =
    json['Time Series (Daily)'] ? 'Time Series (Daily)' :
    json['Weekly Adjusted Time Series'] ? 'Weekly Adjusted Time Series' :
    null;

  if (!seriesKey) return [];

  const series = json[seriesKey];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const entries = Object.entries(series)
    .map(([date, values]) => ({
      date,
      // Use adjusted close when available, otherwise regular close
      price: parseFloat(values['5. adjusted close'] || values['4. close']),
    }))
    .filter((entry) => !isNaN(entry.price) && new Date(entry.date) >= cutoffDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // ascending

  return entries;
}

/**
 * Converts a human-readable period string to a number of calendar days.
 *
 * @param {string} period - One of '1M','3M','6M','1Y','2Y','5Y','10Y','20Y'
 * @returns {number} calendar days (defaults to 365 for unknown periods)
 */
export function periodToDays(period) {
  const map = {
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    '2Y': 730,
    '5Y': 1825,
    '10Y': 3650,
    '20Y': 7300,
  };
  return map[period] || 365;
}
