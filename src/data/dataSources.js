/**
 * dataSources.js
 *
 * The library of REAL, publicly-accessible datasets we compare stock prices
 * against. Every entry is fetched at runtime from a free public API or open
 * data endpoint — no API keys, no hardcoded values, no randomized fakes.
 *
 * Each source is just configuration. To add a new dataset, append an object
 * here with a `provider` (one that `src/api/comparisonApi.js` knows how to
 * fetch) and the `params` that provider needs. The UI and correlation engine
 * pick it up automatically — no other files need to change.
 *
 * ── Provider reference ─────────────────────────────────────────────
 *   'open-meteo'  → Open-Meteo Historical Weather API (CORS *, no key)
 *                   params: { latitude, longitude, daily }
 *   'wikipedia'   → Wikimedia Pageviews REST API (CORS *, no key)
 *                   params: { article }
 *   'usgs-quakes' → USGS Earthquake Catalog (CORS *, no key)
 *                   params: { minmagnitude }  → monthly event counts
 *   'noaa-swpc'   → NOAA Space Weather Prediction Center (CORS *, no key)
 *                   params: { field }         → monthly solar indices
 *   'world-bank'  → World Bank Open Data (CORS *, no key)
 *                   params: { indicator, country }  → annual indicators
 * ───────────────────────────────────────────────────────────────────
 *
 * All series are normalized to a 0–100 index at render time, so wildly
 * different units (°C, pageviews, seconds of daylight, earthquakes, dollars)
 * all share the same dramatic visual space.
 */

const dataSources = [
  // ── Weather patterns ───────────────────────────────────────────
  {
    id: 'antarctica-temp',
    name: 'Daily High Temperature at McMurdo Station, Antarctica',
    emoji: '🧊',
    unit: '°C',
    category: 'Weather',
    provider: 'open-meteo',
    params: { latitude: -77.85, longitude: 166.67, daily: 'temperature_2m_max' },
    sourceUrl: 'https://open-meteo.com/en/docs/historical-weather-api',
  },
  {
    id: 'everest-snowfall',
    name: 'Snowfall on Mount Everest',
    emoji: '❄️',
    unit: 'cm',
    category: 'Weather',
    provider: 'open-meteo',
    params: { latitude: 27.99, longitude: 86.93, daily: 'snowfall_sum' },
    sourceUrl: 'https://open-meteo.com/en/docs/historical-weather-api',
  },
  {
    id: 'amazon-rainfall',
    name: 'Rainfall in the Amazon Rainforest',
    emoji: '🌧️',
    unit: 'mm',
    category: 'Weather',
    provider: 'open-meteo',
    params: { latitude: -3.46, longitude: -62.21, daily: 'precipitation_sum' },
    sourceUrl: 'https://open-meteo.com/en/docs/historical-weather-api',
  },
  {
    id: 'cape-horn-wind',
    name: 'Wind Speed at Cape Horn (the stormiest waters on Earth)',
    emoji: '🌬️',
    unit: 'km/h',
    category: 'Weather',
    provider: 'open-meteo',
    params: { latitude: -55.98, longitude: -67.27, daily: 'wind_speed_10m_max' },
    sourceUrl: 'https://open-meteo.com/en/docs/historical-weather-api',
  },
  {
    id: 'timbuktu-heat',
    name: 'Daily High Temperature in Timbuktu',
    emoji: '🐫',
    unit: '°C',
    category: 'Weather',
    provider: 'open-meteo',
    params: { latitude: 16.77, longitude: -3.0, daily: 'temperature_2m_max' },
    sourceUrl: 'https://open-meteo.com/en/docs/historical-weather-api',
  },
  {
    id: 'oymyakon-cold',
    name: 'Daily Low Temperature in Oymyakon, Siberia',
    emoji: '🥶',
    unit: '°C',
    category: 'Weather',
    provider: 'open-meteo',
    params: { latitude: 63.46, longitude: 142.79, daily: 'temperature_2m_min' },
    sourceUrl: 'https://open-meteo.com/en/docs/historical-weather-api',
  },
  {
    id: 'tornado-alley-gusts',
    name: 'Peak Wind Gusts over Tornado Alley (Oklahoma City)',
    emoji: '🌪️',
    unit: 'km/h',
    category: 'Weather',
    provider: 'open-meteo',
    params: { latitude: 35.47, longitude: -97.5, daily: 'wind_gusts_10m_max' },
    sourceUrl: 'https://open-meteo.com/en/docs/historical-weather-api',
  },

  // ── Astronomical / solar ────────────────────────────────────────
  {
    id: 'reykjavik-daylight',
    name: 'Hours of Daylight in Reykjavík, Iceland',
    emoji: '🌅',
    unit: 'seconds',
    category: 'Astronomical',
    provider: 'open-meteo',
    params: { latitude: 64.13, longitude: -21.9, daily: 'daylight_duration' },
    sourceUrl: 'https://open-meteo.com/en/docs/historical-weather-api',
  },
  {
    id: 'sahara-sunshine',
    name: 'Sunshine Duration in the Sahara Desert',
    emoji: '☀️',
    unit: 'seconds',
    category: 'Astronomical',
    provider: 'open-meteo',
    params: { latitude: 23.42, longitude: 25.66, daily: 'sunshine_duration' },
    sourceUrl: 'https://open-meteo.com/en/docs/historical-weather-api',
  },
  {
    id: 'death-valley-radiation',
    name: 'Solar Radiation over Death Valley',
    emoji: '🔆',
    unit: 'MJ/m²',
    category: 'Astronomical',
    provider: 'open-meteo',
    params: { latitude: 36.5, longitude: -117.0, daily: 'shortwave_radiation_sum' },
    sourceUrl: 'https://open-meteo.com/en/docs/historical-weather-api',
  },
  {
    id: 'sunspots',
    name: 'Number of Sunspots on the Sun',
    emoji: '🌞',
    unit: 'sunspot number',
    category: 'Astronomical',
    provider: 'noaa-swpc',
    params: { field: 'ssn' },
    sourceUrl: 'https://www.swpc.noaa.gov/products/solar-cycle-progression',
  },
  {
    id: 'solar-flux',
    name: 'Solar Radio Flux (F10.7) Blasting from the Sun',
    emoji: '📡',
    unit: 'sfu',
    category: 'Astronomical',
    provider: 'noaa-swpc',
    params: { field: 'f10.7' },
    sourceUrl: 'https://www.swpc.noaa.gov/products/solar-cycle-progression',
  },

  // ── Agricultural commodities ────────────────────────────────────
  {
    id: 'nile-evapotranspiration',
    name: 'Crop Water Loss (Evapotranspiration) in the Nile Delta',
    emoji: '🌾',
    unit: 'mm',
    category: 'Agriculture',
    provider: 'open-meteo',
    params: { latitude: 30.8, longitude: 31.0, daily: 'et0_fao_evapotranspiration' },
    sourceUrl: 'https://open-meteo.com/en/docs/historical-weather-api',
  },
  {
    id: 'world-cereal',
    name: 'Global Cereal Production',
    emoji: '🌽',
    unit: 'metric tons',
    category: 'Agriculture',
    provider: 'world-bank',
    params: { indicator: 'AG.PRD.CREL.MT', country: 'WLD' },
    sourceUrl: 'https://data.worldbank.org/indicator/AG.PRD.CREL.MT',
  },

  // ── Internet / search interest trends ───────────────────────────
  {
    id: 'wiki-bigfoot',
    name: 'People Reading the Wikipedia Page for "Bigfoot"',
    emoji: '🦶',
    unit: 'pageviews',
    category: 'Internet Trends',
    provider: 'wikipedia',
    params: { article: 'Bigfoot' },
    sourceUrl: 'https://en.wikipedia.org/wiki/Bigfoot',
  },
  {
    id: 'wiki-nessie',
    name: 'People Reading the Wikipedia Page for "Loch Ness Monster"',
    emoji: '🦕',
    unit: 'pageviews',
    category: 'Internet Trends',
    provider: 'wikipedia',
    params: { article: 'Loch_Ness_Monster' },
    sourceUrl: 'https://en.wikipedia.org/wiki/Loch_Ness_Monster',
  },
  {
    id: 'wiki-ufo',
    name: 'People Reading the Wikipedia Page for "UFO"',
    emoji: '🛸',
    unit: 'pageviews',
    category: 'Internet Trends',
    provider: 'wikipedia',
    params: { article: 'UFO' },
    sourceUrl: 'https://en.wikipedia.org/wiki/Unidentified_flying_object',
  },
  {
    id: 'wiki-zombie',
    name: 'People Reading the Wikipedia Page for "Zombie"',
    emoji: '🧟',
    unit: 'pageviews',
    category: 'Internet Trends',
    provider: 'wikipedia',
    params: { article: 'Zombie' },
    sourceUrl: 'https://en.wikipedia.org/wiki/Zombie',
  },
  {
    id: 'wiki-lottery',
    name: 'People Reading the Wikipedia Page for "Lottery"',
    emoji: '🎰',
    unit: 'pageviews',
    category: 'Internet Trends',
    provider: 'wikipedia',
    params: { article: 'Lottery' },
    sourceUrl: 'https://en.wikipedia.org/wiki/Lottery',
  },
  {
    id: 'wiki-godzilla',
    name: 'People Reading the Wikipedia Page for "Godzilla"',
    emoji: '🦖',
    unit: 'pageviews',
    category: 'Internet Trends',
    provider: 'wikipedia',
    params: { article: 'Godzilla' },
    sourceUrl: 'https://en.wikipedia.org/wiki/Godzilla',
  },
  {
    id: 'wiki-pizza',
    name: 'People Reading the Wikipedia Page for "Pizza"',
    emoji: '🍕',
    unit: 'pageviews',
    category: 'Internet Trends',
    provider: 'wikipedia',
    params: { article: 'Pizza' },
    sourceUrl: 'https://en.wikipedia.org/wiki/Pizza',
  },
  {
    id: 'wiki-insomnia',
    name: 'People Reading the Wikipedia Page for "Insomnia"',
    emoji: '😴',
    unit: 'pageviews',
    category: 'Internet Trends',
    provider: 'wikipedia',
    params: { article: 'Insomnia' },
    sourceUrl: 'https://en.wikipedia.org/wiki/Insomnia',
  },

  // ── Natural disaster frequency ──────────────────────────────────
  {
    id: 'big-earthquakes',
    name: 'Magnitude 6.0+ Earthquakes Worldwide',
    emoji: '🌍',
    unit: 'quakes/month',
    category: 'Natural Disasters',
    provider: 'usgs-quakes',
    params: { minmagnitude: 6.0 },
    sourceUrl: 'https://earthquake.usgs.gov/earthquakes/search/',
  },

  // ── Public health indicators ────────────────────────────────────
  {
    id: 'world-life-expectancy',
    name: 'Global Average Life Expectancy',
    emoji: '❤️',
    unit: 'years',
    category: 'Public Health',
    provider: 'world-bank',
    params: { indicator: 'SP.DYN.LE00.IN', country: 'WLD' },
    sourceUrl: 'https://data.worldbank.org/indicator/SP.DYN.LE00.IN',
  },
  {
    id: 'world-health-spending',
    name: 'Global Health Spending per Person',
    emoji: '💊',
    unit: 'current US$',
    category: 'Public Health',
    provider: 'world-bank',
    params: { indicator: 'SH.XPD.CHEX.PC.CD', country: 'WLD' },
    sourceUrl: 'https://data.worldbank.org/indicator/SH.XPD.CHEX.PC.CD',
  },

  // ── Government spending categories ──────────────────────────────
  {
    id: 'world-military-spending',
    name: 'World Military Spending (% of GDP)',
    emoji: '💣',
    unit: '% of GDP',
    category: 'Government Spending',
    provider: 'world-bank',
    params: { indicator: 'MS.MIL.XPND.GD.ZS', country: 'WLD' },
    sourceUrl: 'https://data.worldbank.org/indicator/MS.MIL.XPND.GD.ZS',
  },

  // ── Migration / travel patterns ─────────────────────────────────
  {
    id: 'world-tourism',
    name: 'International Tourist Arrivals Worldwide',
    emoji: '✈️',
    unit: 'arrivals',
    category: 'Migration',
    provider: 'world-bank',
    params: { indicator: 'ST.INT.ARVL', country: 'WLD' },
    sourceUrl: 'https://data.worldbank.org/indicator/ST.INT.ARVL',
  },

  // ── Wildlife population counts ──────────────────────────────────
  {
    id: 'world-forest',
    name: 'Forest Area Left on Earth (% of land)',
    emoji: '🌳',
    unit: '% of land',
    category: 'Wildlife & Nature',
    provider: 'world-bank',
    params: { indicator: 'AG.LND.FRST.ZS', country: 'WLD' },
    sourceUrl: 'https://data.worldbank.org/indicator/AG.LND.FRST.ZS',
  },
];

export default dataSources;
