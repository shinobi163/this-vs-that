import { useMemo } from 'react';
import { generatePunchline } from '../data/punchlines';

/**
 * PunchlineCard — displays a witty, data-driven quip about the comparison.
 *
 * Computes whether the stock went up or down over the selected period
 * and generates an appropriately snarky punchline.
 *
 * Props:
 *   stockName   – display name of the stock (e.g. 'NVIDIA')
 *   datasetName – display name of the absurd dataset (e.g. 'Avocado Prices')
 *   stockData   – [{ date, price }] array to determine trend direction
 */
export default function PunchlineCard({ stockName, datasetName, stockData }) {
  // Determine the trend direction from the stock data
  const trend = useMemo(() => {
    if (!stockData || stockData.length < 2) return 'flat';

    const firstPrice = stockData[0].price;
    const lastPrice = stockData[stockData.length - 1].price;
    const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;

    if (changePercent > 5) return 'up';
    if (changePercent < -5) return 'down';
    return 'flat';
  }, [stockData]);

  // Generate the punchline text
  const priceValues = useMemo(() => {
    return stockData.map((d) => d.price);
  }, [stockData]);

  const punchline = useMemo(() => {
    return generatePunchline(stockName, datasetName, priceValues);
  }, [stockName, datasetName, priceValues]);

  if (!punchline) return null;

  return (
    <div className="punchline-card glass-card">
      <blockquote className="punchline-quote">
        <span className="punchline-emoji" aria-hidden="true">
          {trend === 'up' ? '📈' : trend === 'down' ? '📉' : '🤔'}
        </span>
        <span className="punchline-text">{punchline}</span>
      </blockquote>
    </div>
  );
}
