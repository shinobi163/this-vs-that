import { getDemoData } from '../data/demoData';

const API_KEY = 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

export async function fetchStockData(ticker, days) {
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

    if (json['Error Message'] || json['Note'] || json['Information']) {
      console.warn('[stockApi] API returned an error/note, falling back to demo data:', json);
      return getDemoData(ticker, days);
    }

    const parsed = parseTimeSeries(json, days);

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

function buildRequestParams(ticker, days) {
  if (days <= 100) {
    return {
      function: 'TIME_SERIES_DAILY',
      symbol: ticker,
      outputsize: 'compact',
      apikey: API_KEY,
    };
  }

  if (days > 730) {
    return {
      function: 'TIME_SERIES_WEEKLY_ADJUSTED',
      symbol: ticker,
      apikey: API_KEY,
    };
  }

  return {
    function: 'TIME_SERIES_DAILY',
    symbol: ticker,
    outputsize: 'full',
    apikey: API_KEY,
  };
}

function parseTimeSeries(json, days) {
  const seriesKey =
    json['Time Series (Daily)'] ? 'Time Series (Daily)' :
    json['Weekly Adjusted Time Series'] ? 'Weekly Adjusted Time Series' :
    null;

  if (!seriesKey) return [];

  const series = json[seriesKey];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return Object.entries(series)
    .map(([date, values]) => ({
      date,
      price: parseFloat(values['5. adjusted close'] || values['4. close']),
    }))
    .filter((entry) => !isNaN(entry.price) && new Date(entry.date) >= cutoffDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
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
  return map[period] || 2190; // default to 6Y if unknown
}
