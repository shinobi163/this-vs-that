// trendGenerator.js

export function pearsonCorrelation(a, b) {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  const meanA = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const meanB = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const diffA = a[i] - meanA;
    const diffB = b[i] - meanB;
    num += diffA * diffB;
    da += diffA * diffA;
    db += diffB * diffB;
  }
  const denom = Math.sqrt(da * db);
  return denom === 0 ? 0 : parseFloat((num / denom).toFixed(2));
}

export function pearsonLabel(r) {
  const abs = Math.abs(r);
  if (abs >= 0.8) return r > 0 ? "Your broker doesn't want you to see this." : "Inversely suspicious. Short it.";
  if (abs >= 0.5) return "Statistically suspicious.";
  if (abs >= 0.3) return "Weakly correlated, like most relationships.";
  return "No correlation. Pure chaos. Invest anyway.";
}

export function normalise(values) {
  // Use % change from first value so small-range series like M2
  // aren't flattened when compared against volatile daily stock prices
  const base = values[0] || 1;
  const pctChanges = values.map((v) => (v - base) / Math.abs(base));
  const min = Math.min(...pctChanges);
  const max = Math.max(...pctChanges);
  const range = max - min || 1;
  return pctChanges.map((v) => (v - min) / range);
}

// Aligns real fetched dataset to stock date points by nearest month
export function alignDataset(stockPrices, datasetPoints) {
  if (!datasetPoints || datasetPoints.length === 0) {
    return stockPrices.map(() => null);
  }

  return stockPrices.map(({ date }) => {
    const stockTime = new Date(date).getTime();

    // Find the two nearest dataset points and interpolate between them
    let before = null;
    let after = null;

    for (const point of datasetPoints) {
      const t = new Date(point.date).getTime();
      if (t <= stockTime) before = point;
      if (t >= stockTime && !after) after = point;
    }

    if (before && after && before.date !== after.date) {
      const t0 = new Date(before.date).getTime();
      const t1 = new Date(after.date).getTime();
      const ratio = (stockTime - t0) / (t1 - t0);
      return parseFloat((before.value + ratio * (after.value - before.value)).toFixed(2));
    }

    if (before) return before.value;
    if (after) return after.value;
    return null;
  });
}

// Fills null gaps with linear interpolation so the chart line stays continuous
export function interpolateNulls(values) {
  const result = [...values];
  for (let i = 0; i < result.length; i++) {
    if (result[i] === null) {
      let left = i - 1;
      let right = i + 1;
      while (right < result.length && result[right] === null) right++;
      if (left >= 0 && right < result.length) {
        result[i] = result[left] + ((result[right] - result[left]) * (i - left)) / (right - left);
      } else if (left >= 0) {
        result[i] = result[left];
      } else if (right < result.length) {
        result[i] = result[right];
      }
    }
  }
  return result;
}
