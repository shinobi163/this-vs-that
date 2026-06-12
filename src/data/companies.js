const companies = [
  // ── Technology ──────────────────────────────────────────────
  { ticker: 'AAPL',  name: 'Apple',              sector: 'Technology' },
  { ticker: 'NVDA',  name: 'NVIDIA',             sector: 'Technology' },
  { ticker: 'MSFT',  name: 'Microsoft',          sector: 'Technology' },
  { ticker: 'GOOGL', name: 'Alphabet',           sector: 'Technology' },
  { ticker: 'META',  name: 'Meta Platforms',     sector: 'Technology' },
  { ticker: 'AMZN',  name: 'Amazon',             sector: 'Technology' },
  { ticker: 'CRM',   name: 'Salesforce',         sector: 'Technology' },
  { ticker: 'ORCL',  name: 'Oracle',             sector: 'Technology' },
  { ticker: 'ADBE',  name: 'Adobe',              sector: 'Technology' },
  { ticker: 'INTC',  name: 'Intel',              sector: 'Technology' },
  { ticker: 'AMD',   name: 'AMD',                sector: 'Technology' },
  { ticker: 'CSCO',  name: 'Cisco',              sector: 'Technology' },
  { ticker: 'IBM',   name: 'IBM',                sector: 'Technology' },
  { ticker: 'SHOP',  name: 'Shopify',            sector: 'Technology' },
  { ticker: 'SNOW',  name: 'Snowflake',          sector: 'Technology' },

  // ── Finance ─────────────────────────────────────────────────
  { ticker: 'JPM',   name: 'JPMorgan Chase',     sector: 'Finance' },
  { ticker: 'V',     name: 'Visa',               sector: 'Finance' },
  { ticker: 'MA',    name: 'Mastercard',          sector: 'Finance' },
  { ticker: 'BAC',   name: 'Bank of America',    sector: 'Finance' },
  { ticker: 'GS',    name: 'Goldman Sachs',       sector: 'Finance' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway',  sector: 'Finance' },
  { ticker: 'MS',    name: 'Morgan Stanley',      sector: 'Finance' },

  // ── Healthcare ──────────────────────────────────────────────
  { ticker: 'JNJ',   name: 'Johnson & Johnson',  sector: 'Healthcare' },
  { ticker: 'UNH',   name: 'UnitedHealth',       sector: 'Healthcare' },
  { ticker: 'PFE',   name: 'Pfizer',             sector: 'Healthcare' },
  { ticker: 'ABBV',  name: 'AbbVie',             sector: 'Healthcare' },
  { ticker: 'LLY',   name: 'Eli Lilly',          sector: 'Healthcare' },
  { ticker: 'MRK',   name: 'Merck',              sector: 'Healthcare' },
  { ticker: 'TMO',   name: 'Thermo Fisher',      sector: 'Healthcare' },

  // ── Consumer ────────────────────────────────────────────────
  { ticker: 'WMT',   name: 'Walmart',            sector: 'Consumer' },
  { ticker: 'COST',  name: 'Costco',             sector: 'Consumer' },
  { ticker: 'KO',    name: 'Coca-Cola',          sector: 'Consumer' },
  { ticker: 'PEP',   name: 'PepsiCo',            sector: 'Consumer' },
  { ticker: 'MCD',   name: 'McDonald\'s',        sector: 'Consumer' },
  { ticker: 'SBUX',  name: 'Starbucks',          sector: 'Consumer' },
  { ticker: 'NKE',   name: 'Nike',               sector: 'Consumer' },
  { ticker: 'PG',    name: 'Procter & Gamble',   sector: 'Consumer' },

  // ── Energy ──────────────────────────────────────────────────
  { ticker: 'XOM',   name: 'ExxonMobil',         sector: 'Energy' },
  { ticker: 'CVX',   name: 'Chevron',            sector: 'Energy' },
  { ticker: 'COP',   name: 'ConocoPhillips',     sector: 'Energy' },
  { ticker: 'NEE',   name: 'NextEra Energy',     sector: 'Energy' },

  // ── Automotive ──────────────────────────────────────────────
  { ticker: 'TSLA',  name: 'Tesla',              sector: 'Automotive' },
  { ticker: 'F',     name: 'Ford',               sector: 'Automotive' },
  { ticker: 'GM',    name: 'General Motors',      sector: 'Automotive' },
  { ticker: 'RIVN',  name: 'Rivian',             sector: 'Automotive' },

  // ── Entertainment ───────────────────────────────────────────
  { ticker: 'DIS',   name: 'Walt Disney',        sector: 'Entertainment' },
  { ticker: 'NFLX',  name: 'Netflix',            sector: 'Entertainment' },
  { ticker: 'SPOT',  name: 'Spotify',            sector: 'Entertainment' },
  { ticker: 'RBLX',  name: 'Roblox',             sector: 'Entertainment' },

  // ── Telecom ─────────────────────────────────────────────────
  { ticker: 'T',     name: 'AT&T',               sector: 'Telecom' },
  { ticker: 'VZ',    name: 'Verizon',            sector: 'Telecom' },
  { ticker: 'TMUS',  name: 'T-Mobile',           sector: 'Telecom' },
];

export default companies;
