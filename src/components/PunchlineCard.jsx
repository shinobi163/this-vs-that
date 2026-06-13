import { useMemo } from 'react';
import { generatePunchline } from '../data/punchlines';

export default function PunchlineCard({ stockName, datasetName, stockData, pearson }) {
  const trend = useMemo(() => {
    if (!stockData || stockData.length < 2) return 'flat';
    const firstPrice = stockData[0].price;
    const lastPrice = stockData[stockData.length - 1].price;
    const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
    if (changePercent > 5) return 'up';
    if (changePercent < -5) return 'down';
    return 'flat';
  }, [stockData]);

  const priceValues = useMemo(() => {
    return stockData.map((d) => d.price);
  }, [stockData]);

  const punchline = useMemo(() => {
    return generatePunchline(stockName, datasetName, priceValues, pearson);
  }, [stockName, datasetName, priceValues, pearson]);

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
