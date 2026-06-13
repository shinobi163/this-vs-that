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
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v) => (v - min) / range);
}

// Aligns real fetched dataset to stock date points by nearest month
export function alignDataset(stockPrices, datasetPoints) {
  if (!datasetPoints || datasetPoints.length === 0) return stockPrices.map(() => null);
  return stockPrices.map(({ date }) => {
    const stockMonth = date.slice(0, 7);
    const match = datasetPoints.find((d) => d.date.slice(0, 7) === stockMonth);
    return match ? match.value : null;
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
