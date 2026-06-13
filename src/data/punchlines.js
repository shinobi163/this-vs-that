const punchlines = [
  // ── Deadpan ─────────────────────────────────────────────────
  { template: "{stock}'s {direction} perfectly mirrors {dataset}. Coincidence? Probably.",                                     mood: 'deadpan'    },
  { template: "If you squint hard enough, {stock} is literally just {dataset} wearing a trench coat.",                         mood: 'deadpan'    },
  { template: "The data is in. {stock} and {dataset}: same energy. Correlation: {correlation}.",                               mood: 'deadpan'    },
  { template: "We checked three times. {stock} is still correlated with {dataset}. We need a nap.",                            mood: 'deadpan'    },
  { template: "Turns out {stock}'s {direction} was just {dataset} all along. Always has been. 🔫",                             mood: 'deadpan'    },

  // ── Conspiracy ──────────────────────────────────────────────
  { template: "Wall Street doesn't want you to know that {stock} is basically just {dataset} in a suit.",                      mood: 'conspiracy' },
  { template: "BREAKING: Leaked documents reveal {stock} has been tracking {dataset} since 2019.",                              mood: 'conspiracy' },
  { template: "The hedge funds are hiding this. {stock} + {dataset} = {correlation} correlation. Wake up, sheeple.",           mood: 'conspiracy' },
  { template: "Big Finance is NOT ready for you to see the link between {stock} and {dataset}.",                               mood: 'conspiracy' },
  { template: "Follow the money. Follow {dataset}. They lead to the same place: {stock}.",                                     mood: 'conspiracy' },
  { template: "We weren't supposed to find this. {stock}'s {direction} maps to {dataset} at {correlation}. Delete your browser history.", mood: 'conspiracy' },

  // ── Alarmed ─────────────────────────────────────────────────
  { template: "We ran the numbers. {stock} and {dataset} have a correlation of {correlation}. We're scared.",                  mood: 'alarmed'    },
  { template: "Holy spreadsheets. {stock}'s {direction} and {dataset} are a {correlation} match. Send help.",                  mood: 'alarmed'    },
  { template: "This can't be right. {stock} just predicted {dataset}? Correlation: {correlation}. Somebody call a scientist.", mood: 'alarmed'    },
  { template: "Our interns are crying. The {stock}–{dataset} correlation is {correlation}. This wasn't supposed to happen.",   mood: 'alarmed'    },
  { template: "DEFCON 1: {stock} and {dataset} are moving in lockstep. Correlation: {correlation}. This is not a drill.",      mood: 'alarmed'    },

  // ── Sarcastic ───────────────────────────────────────────────
  { template: "Oh sure, {stock}'s {direction} has NOTHING to do with {dataset}. Sure. Totally normal. ({correlation})",        mood: 'sarcastic'  },
  { template: "Investors HATE this one weird trick: just predict {stock} by watching {dataset}. Easy.",                         mood: 'sarcastic'  },
  { template: "Who needs a Bloomberg Terminal when you have {dataset}? Correlation with {stock}: {correlation}.",               mood: 'sarcastic'  },
  { template: "Forget P/E ratios. The real alpha is in {dataset}. Ask {stock}. ({correlation})",                               mood: 'sarcastic'  },
  { template: "Your finance professor would be SO proud. {stock} = f({dataset}). R² = yes.",                                   mood: 'sarcastic'  },

  // ── Philosophical ───────────────────────────────────────────
  { template: "Is {stock} driving {dataset}, or is {dataset} driving {stock}? The market doesn't care.",                       mood: 'philosophical' },
  { template: "In the grand tapestry of capitalism, {stock} and {dataset} are the same thread. ({correlation})",               mood: 'philosophical' },
  { template: "Perhaps {stock}'s {direction} is just the universe telling us to pay attention to {dataset}.",                   mood: 'philosophical' },
  { template: "Correlation: {correlation}. Causation: debatable. Vibes: immaculate. {stock} ↔ {dataset}.",                     mood: 'philosophical' },

  // ── Excited ─────────────────────────────────────────────────
  { template: "🚨 {stock} and {dataset} are a {correlation} match! This is the DD we've been waiting for! 🚀",                mood: 'excited'    },
  { template: "LET'S GOOO! {stock}'s {direction} is LITERALLY {dataset}! Correlation: {correlation}! 📈",                     mood: 'excited'    },
  { template: "Pack it up, Wall Street. We cracked the code. {stock} = {dataset}. {correlation} correlation. Nobel Prize when?", mood: 'excited'  },
  { template: "THIS IS IT. The {stock}–{dataset} connection is REAL ({correlation}). Tell your friends. Tell your mom.",        mood: 'excited'    },

  // ── Unhinged ────────────────────────────────────────────────
  { template: "I haven't slept in 72 hours but I FOUND IT. {stock} IS {dataset}. Correlation: {correlation}. I'm fine.",       mood: 'unhinged'   },
  { template: "{stock}... {dataset}... {correlation}... it's all connected. THE CHART NEVER LIES. *tapes string to wall*",     mood: 'unhinged'   },
  { template: "My therapist says I need to stop comparing {stock} to {dataset}. But she can't argue with {correlation}.",      mood: 'unhinged'   },
];

// ── Direction helpers ─────────────────────────────────────────
const DIRECTIONS = [
  { label: 'meteoric rise',    minSlope: 0.6   },
  { label: 'steady climb',     minSlope: 0.15  },
  { label: 'gradual incline',  minSlope: 0.02  },
  { label: 'sideways shuffle', minSlope: -0.02 },
  { label: 'gradual decline',  minSlope: -0.15 },
  { label: 'free-fall',        minSlope: -Infinity },
];

function classifyDirection(prices) {
  if (!prices || prices.length < 2) return 'wild ride';

  const first = prices[0];
  const last = prices[prices.length - 1];
  const slope = (last - first) / first;

  // Check volatility — if the standard deviation relative to the range
  // is high, call it a rollercoaster / wild ride regardless of net slope
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((a, p) => a + (p - mean) ** 2, 0) / prices.length;
  const cv = Math.sqrt(variance) / mean;

  if (cv > 0.25) return 'wild ride';
  if (cv > 0.18) return 'rollercoaster';

  for (const d of DIRECTIONS) {
    if (slope >= d.minSlope) return d.label;
  }
  return 'wild ride';
}


// ── Public API ────────────────────────────────────────────────

/**
 * Pick a random punchline and fill in the placeholders.
 *
 * @param {string}   stockName      e.g. "NVIDIA"
 * @param {string}   datasetName    e.g. "Global Instant Noodle Consumption"
 * @param {number[]} [priceValues]  raw price array used to auto-detect direction
 * @returns {string} A fully-rendered punchline string.
 */
export function generatePunchline(stockName, datasetName, priceValues = [], realCorrelation = null) {
  const direction   = classifyDirection(priceValues);
  const correlation = realCorrelation !== null ? realCorrelation : '0.99';
  
  const pick = punchlines[Math.floor(Math.random() * punchlines.length)];

  return pick.template
    .replace(/\{stock\}/g,       stockName)
    .replace(/\{dataset\}/g,     datasetName)
    .replace(/\{direction\}/g,   direction)
    .replace(/\{correlation\}/g, correlation);
}

export default punchlines;
