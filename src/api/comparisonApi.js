/**
 * comparisonApi.js
 *
 * Fetches REAL data for a configured data source (see src/data/dataSources.js)
 * at runtime from free, key-less, CORS-enabled public APIs, then aligns it to
 * the stock's date range so the two series can be plotted index-for-index.
 *
 * Supported providers (all verified CORS `*`, no API key required):
 *   open-meteo   → Open-Meteo Historical Weather API
 *   wikipedia    → Wikimedia Pageviews REST API
 *   usgs-quakes  → USGS Earthquake Catalog (GeoJSON) bucketed per month
 *   noaa-swpc    → NOAA Space Weather Prediction Center solar-cycle indices
 *   world-bank   → World Bank Open Data annual indicators
 *
 * Every provider returns a chronologically-sorted array of
 * `{ date: 'YYYY-MM-DD', value: number }`. We then resample that series to
 * exactly match the number of stock data points and re-stamp it with the
 * stock's own dates, so the existing chart (which zips the two series by
 * index) lines up perfectly. Values are left in their natural units — the
 * chart normalizes everything to a 0–100 index at render time.
 */

// ─── Small date helpers ──────────────────────────────────────────
function toISO(d) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
function toCompact(dateStr) {
  return dateStr.replaceAll('-', ''); // YYYYMMDD
}
function clampDate(dateStr, minStr, maxStr) {
  let s = dateStr;
  if (minStr && s < minStr) s = minStr;
  if (maxStr && s > maxStr) s = maxStr;
  return s;
}

/**
 * Resample a raw `{date, value}` series to exactly `targetDates.length`
 * points using linear interpolation, then re-stamp with the target dates.
 * This guarantees index alignment with the stock series.
 */
function resampleToDates(raw, targetDates) {
  const clean = (raw || []).filter(
    (p) => p && p.value !== null && p.value !== undefined && !Number.isNaN(Number(p.value))
  );
  if (clean.length === 0) return [];

  const values = clean.map((p) => Number(p.value));
  const m = values.length;
  const n = targetDates.length;

  return targetDates.map((date, i) => {
    let v;
    if (m === 1 || n === 1) {
      v = values[0];
    } else {
      const pos = (i / (n - 1)) * (m - 1);
      const lo = Math.floor(pos);
      const hi = Math.ceil(pos);
      const frac = pos - lo;
      v = values[lo] + (values[hi] - values[lo]) * frac;
    }
    return { date, value: parseFloat(v.toFixed(4)) };
  });
}

async function getJSON(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

// ─── Provider: Open-Meteo (daily weather/astronomical archive) ────
async function fetchOpenMeteo(params, startDate, endDate) {
  // Open-Meteo's archive lags real time by a few days; clamp the window.
  const maxArchive = toISO(new Date(Date.now() - 6 * 86400000));
  const start = clampDate(startDate, '1940-01-01', maxArchive);
  const end = clampDate(endDate, '1940-01-02', maxArchive);

  const q = new URLSearchParams({
    latitude: String(params.latitude),
    longitude: String(params.longitude),
    start_date: start,
    end_date: end,
    daily: params.daily,
    timezone: 'GMT',
  });
  const json = await getJSON(`https://archive-api.open-meteo.com/v1/archive?${q}`);
  const times = json?.daily?.time || [];
  const vals = json?.daily?.[params.daily] || [];
  return times.map((date, i) => ({ date, value: vals[i] }));
}

// ─── Provider: Wikimedia Pageviews ────────────────────────────────
async function fetchWikipedia(params, startDate, endDate) {
  // Pageview data is only available from 2015-07-01 onwards.
  const start = clampDate(startDate, '2015-07-01', endDate);
  // Daily for ≤ ~1.5y windows, monthly for longer ones (keeps payloads sane).
  const spanDays =
    (new Date(endDate) - new Date(start)) / 86400000;
  const granularity = spanDays <= 550 ? 'daily' : 'monthly';

  const url =
    `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/` +
    `en.wikipedia/all-access/all-agents/` +
    `${encodeURIComponent(params.article)}/${granularity}/` +
    `${toCompact(start)}/${toCompact(endDate)}`;

  const json = await getJSON(url);
  const items = json?.items || [];
  return items.map((it) => {
    // timestamp is YYYYMMDD00
    const ts = String(it.timestamp);
    const date = `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
    return { date, value: it.views };
  });
}

// ─── Provider: USGS earthquakes (monthly counts) ──────────────────
async function fetchUsgsQuakes(params, startDate, endDate) {
  const q = new URLSearchParams({
    format: 'geojson',
    starttime: startDate,
    endtime: endDate,
    minmagnitude: String(params.minmagnitude),
    orderby: 'time-asc',
    limit: '20000',
  });
  const json = await getJSON(`https://earthquake.usgs.gov/fdsnws/event/1/query?${q}`);
  const features = json?.features || [];

  // Bucket event counts by calendar month.
  const buckets = new Map();
  for (const f of features) {
    const t = f?.properties?.time;
    if (!t) continue;
    const d = new Date(t);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  return [...buckets.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ─── Provider: NOAA SWPC solar-cycle indices (monthly) ────────────
let _swpcCache = null;
async function fetchNoaaSwpc(params, startDate, endDate) {
  if (!_swpcCache) {
    _swpcCache = await getJSON(
      'https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json'
    );
  }
  const field = params.field; // e.g. 'ssn' or 'f10.7'
  const all = _swpcCache
    .map((row) => ({ date: `${row['time-tag']}-01`, value: row[field] }))
    .filter((p) => p.value !== null && p.value !== undefined)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const windowed = all.filter(
    (p) => p.date >= startDate.slice(0, 7) + '-01' && p.date <= endDate
  );
  // Solar indices over a short window can be too few points to be interesting;
  // fall back to the most recent ~60 months so the curve has real shape.
  return windowed.length >= 2 ? windowed : all.slice(-60);
}

// ─── Provider: World Bank (annual indicators) ─────────────────────
async function fetchWorldBank(params, startDate, endDate) {
  const startYear = startDate.slice(0, 4);
  const endYear = endDate.slice(0, 4);
  const url =
    `https://api.worldbank.org/v2/country/${params.country}/indicator/${params.indicator}` +
    `?format=json&per_page=500&date=${startYear}:${endYear}`;
  const json = await getJSON(url);
  const rows = Array.isArray(json) ? json[1] : null;
  if (!rows) return [];
  return rows
    .filter((r) => r.value !== null && r.value !== undefined)
    .map((r) => ({ date: `${r.date}-01-01`, value: r.value }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ─── Dispatcher ───────────────────────────────────────────────────
const PROVIDERS = {
  'open-meteo': fetchOpenMeteo,
  wikipedia: fetchWikipedia,
  'usgs-quakes': fetchUsgsQuakes,
  'noaa-swpc': fetchNoaaSwpc,
  'world-bank': fetchWorldBank,
};

/**
 * Fetch and align a configured data source to the given stock series.
 *
 * @param {{provider: string, params: object, name: string}} source
 * @param {Array<{date: string, price: number}>} stockData  (ascending by date)
 * @returns {Promise<Array<{date: string, value: number}>>}
 * @throws if the provider is unknown or the fetch yields no usable data.
 */
export async function fetchComparisonData(source, stockData) {
  if (!stockData?.length) throw new Error('No stock data to align against.');

  const fetcher = PROVIDERS[source.provider];
  if (!fetcher) throw new Error(`Unknown provider: ${source.provider}`);

  const startDate = stockData[0].date;
  const endDate = stockData[stockData.length - 1].date;
  const targetDates = stockData.map((d) => d.date);

  const raw = await fetcher(source.params, startDate, endDate);
  const aligned = resampleToDates(raw, targetDates);

  if (aligned.length === 0) {
    throw new Error(`No usable data returned for "${source.name}".`);
  }
  return aligned;
}
