import { getDemoData } from '../data/demoData';

const API_KEY = import.meta.env.VITE_TWELVE_DATA_KEY || '';
const BASE_URL = 'https://api.twelvedata.com';

/**
 * Fetches historical stock price data using Twelve Data API.
 * Falls back to demo data if no key is set or on any error.
 */
export async function fetchStockData(ticker, days) {
  if (!API_KEY) {
    console.warn('[stockApi] No Twelve Data key found, using demo data.');
    return getDemoData(ticker, days);
  }

  try {
    // Twelve Data uses interval + outputsize to control history depth
    // For 6 years we use weekly interval to get clean long-range data
    const interval = days > 365 ? '1week' : '1day';
    const outputsize = Math.min(Math.ceil(days / (days > 365 ? 7 : 1)), 5000);

    const params = new URLSearchParams({
      symbol: ticker,
      interval,
      outputsize,
      apikey: API_KEY,
      format: 'JSON',
      order: 'ASC',
    });

    const response = await fetch(`${BASE_URL}/time_series?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.status === 'error' || !json.values) {
      console.warn('[stockApi] Twelve Data returned error, falling back:', json.message);
      return getDemoData(ticker, days);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const parsed = json.values
      .map((entry) => ({
        date: entry.datetime,
        price: parseFloat(entry.close),
      }))
      .filter((entry) => !isNaN(entry.price) && new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (!parsed || parsed.length === 0) {
      console.warn('[stockApi] Parsed data empty, falling back to demo data.');
      return getDemoData(ticker, days);
    }

    return parsed;
  } catch (error) {
    console.error('[stockApi] Fetch failed, falling back to demo data:', error.message);
    return getDemoData(ticker, days);
  }
}

export function periodToDays(period) {
  const map = {
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    '2Y': 730,
    '5Y': 1825,
    '6Y': 2190,
    '10Y': 3650,
    '20Y': 7300,
  };
  return map[period] || 2190;
}
