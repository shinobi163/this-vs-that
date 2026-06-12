import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Info } from 'lucide-react';

// ─── Theme colors ────────────────────────────────────────────────
const STOCK_COLOR = '#00f0ff';       // Neon cyan
const COMPARISON_COLOR = '#ff006e';  // Neon pink

/**
 * Normalizes an array of values to a 0–100 range.
 * This lets two completely different data sets (stock prices vs. avocado prices)
 * share the same visual space on the chart.
 */
function normalize(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // avoid division by zero
  return values.map((v) => ((v - min) / range) * 100);
}

/**
 * Formats a date string into 'MMM YY' (e.g. 'Jan 24') for axis ticks.
 */
function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = String(d.getFullYear()).slice(-2);
  return `${months[d.getMonth()]} '${year}`;
}

/**
 * Formats a date string into a more readable form for the tooltip.
 */
function formatDateLong(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Custom Tooltip ──────────────────────────────────────────────
function CustomTooltip({ active, payload, label, stockName, comparisonName }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="chart-tooltip glass-card">
      <p className="tooltip-date">{formatDateLong(label)}</p>
      <div className="tooltip-row">
        <span className="tooltip-dot" style={{ background: STOCK_COLOR }} />
        <span className="tooltip-label">{stockName}</span>
        <span className="tooltip-value">{payload[0]?.value?.toFixed(1)}</span>
      </div>
      {payload[1] && (
        <div className="tooltip-row">
          <span className="tooltip-dot" style={{ background: COMPARISON_COLOR }} />
          <span className="tooltip-label">{comparisonName}</span>
          <span className="tooltip-value">{payload[1]?.value?.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Custom Legend ────────────────────────────────────────────────
function CustomLegend({
  stockName,
  stockTicker,
  comparisonName,
  comparisonEmoji,
  comparisonSourceUrl,
}) {
  return (
    <div className="chart-legend">
      <div className="legend-item">
        <span className="legend-dot" style={{ background: STOCK_COLOR }} />
        <span className="legend-text">{stockName}</span>
        {stockTicker && (
          <a
            href={`https://finance.yahoo.com/quote/${stockTicker}`}
            target="_blank"
            rel="noopener noreferrer"
            className="legend-info-link"
            title="View Yahoo Finance source"
          >
            <Info size={12} />
          </a>
        )}
      </div>
      <div className="legend-item">
        <span className="legend-dot" style={{ background: COMPARISON_COLOR }} />
        <span className="legend-text">
          {comparisonEmoji && <span className="legend-emoji">{comparisonEmoji} </span>}
          {comparisonName}
        </span>
        {comparisonSourceUrl && (
          <a
            href={comparisonSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="legend-info-link"
            title="View dataset source"
          >
            <Info size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * ComparisonChart — overlays a stock's performance against an absurd dataset.
 *
 * Both datasets are normalized to 0–100 so they visually overlap regardless
 * of the actual value ranges (e.g. $180 stock price vs. 3.2 billion burritos).
 *
 * Props:
 *   stockData       – [{ date, price }]
 *   comparisonData  – [{ date, price }]
 *   stockName       – display name for the stock line
 *   comparisonName  – display name for the comparison line
 *   comparisonEmoji – emoji for the comparison dataset
 */
export default function ComparisonChart({
  stockData,
  comparisonData,
  stockName,
  stockTicker,
  comparisonName,
  comparisonEmoji,
  comparisonSourceUrl,
}) {
  // Merge and normalize both datasets into a single Recharts-friendly array
  const chartData = useMemo(() => {
    if (!stockData?.length || !comparisonData?.length) return [];

    // Use the shorter array's length so both lines span the same dates
    const len = Math.min(stockData.length, comparisonData.length);

    const stockPrices = stockData.slice(0, len).map((d) => d.price);
    const compPrices = comparisonData.slice(0, len).map((d) => d.value !== undefined ? d.value : d.price);

    const normStock = normalize(stockPrices);
    const normComp = normalize(compPrices);

    return stockData.slice(0, len).map((d, i) => ({
      date: d.date,
      stock: parseFloat(normStock[i].toFixed(2)),
      comparison: parseFloat(normComp[i].toFixed(2)),
    }));
  }, [stockData, comparisonData]);

  // Thin out X-axis ticks so labels don't overlap
  const tickInterval = useMemo(() => {
    if (chartData.length <= 12) return 0; // show all
    return Math.floor(chartData.length / 8); // ~8 labels
  }, [chartData]);

  if (chartData.length === 0) return null;

  return (
    <div className="chart-container glass-card">
      {/* Chart header */}
      <h3 className="chart-title">
        {stockName}
        <span className="chart-title-vs"> vs </span>
        {comparisonEmoji && <span>{comparisonEmoji} </span>}
        {comparisonName}
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.05)"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            interval={tickInterval}
            tick={{ fill: 'rgba(255, 255, 255, 0.4)', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            tickLine={false}
          />

          <YAxis
            hide // Values are normalized 0–100; absolute numbers are meaningless
          />

          <Tooltip
            content={
              <CustomTooltip
                stockName={stockName}
                comparisonName={comparisonName}
              />
            }
            cursor={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
          />

          <Legend
            content={
              <CustomLegend
                stockName={stockName}
                stockTicker={stockTicker}
                comparisonName={comparisonName}
                comparisonEmoji={comparisonEmoji}
                comparisonSourceUrl={comparisonSourceUrl}
              />
            }
          />

          {/* Stock line — cyan */}
          <Line
            type="monotone"
            dataKey="stock"
            name={stockName}
            stroke={STOCK_COLOR}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: STOCK_COLOR, stroke: '#fff', strokeWidth: 1 }}
            animationDuration={1200}
            animationEasing="ease-in-out"
          />

          {/* Comparison line — pink, starts animating 600ms after stock */}
          <Line
            type="monotone"
            dataKey="comparison"
            name={comparisonName}
            stroke={COMPARISON_COLOR}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: COMPARISON_COLOR, stroke: '#fff', strokeWidth: 1 }}
            animationDuration={1200}
            animationBegin={600}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
