import { useState, useRef, useCallback } from 'react';
import CompanyDropdown from './components/CompanyDropdown';
import FauxLoadingScreen from './components/FauxLoadingScreen';
import ComparisonChart from './components/ComparisonChart';
import PunchlineCard from './components/PunchlineCard';
import ActionButtons from './components/ActionButtons';
import { fetchStockData, periodToDays } from './api/stockApi';
import { alignDataset, interpolateNulls, normalise, pearsonCorrelation, pearsonLabel } from './data/trendGenerator';
import absurdDatasets from './data/absurdDatasets';
import companies from './data/companies';

const FIXED_PERIOD = '6Y';

export default function App() {
  const [selectedTicker, setSelectedTicker] = useState('');
  const [appState, setAppState] = useState('idle');
  const [stockData, setStockData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [currentDataset, setCurrentDataset] = useState(null);
  const [pearson, setPearson] = useState(null);
  const [chartKey, setChartKey] = useState(0);
  const [dataReady, setDataReady] = useState(false);
  const chartRef = useRef(null);

  const getCompanyName = useCallback((ticker) => {
    const company = companies.find((c) => c.ticker === ticker);
    return company ? company.name : ticker;
  }, []);

  const runComparison = useCallback(async (ticker) => {
    setAppState('loading');
    setPearson(null);
    setDataReady(false);

    const days = periodToDays(FIXED_PERIOD);
    const prices = await fetchStockData(ticker, days);
    setStockData(prices);

    const startDate = prices[0]?.date || new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const endDate = prices[prices.length - 1]?.date || new Date().toISOString().slice(0, 10);

    const stockValues = normalise(prices.map((p) => p.price));

    const results = await Promise.allSettled(
      absurdDatasets.map(async (dataset) => {
        const points = await dataset.fetchFn(startDate, endDate);
        const aligned = interpolateNulls(alignDataset(prices, points));
        const compValues = normalise(aligned.map((v) => v ?? 0));
        const r = pearsonCorrelation(stockValues, compValues);
        return { dataset, aligned, r };
      })
    );

    const valid = results
      .filter((r) => r.status === 'fulfilled' && r.value.aligned.some((v) => v !== null))
      .map((r) => r.value)
      .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

    const best = valid[0];

    setCurrentDataset(best.dataset);
    setComparisonData(prices.map((p, i) => ({ date: p.date, value: best.aligned[i] ?? 0 })));
    setPearson(best.r);
    setChartKey((k) => k + 1);

    // Signal to loading screen that data is ready
    setDataReady(true);
  }, []);

  const handleCompanyChange = useCallback((ticker) => {
    setSelectedTicker(ticker);
    if (ticker) runComparison(ticker);
  }, [runComparison]);

  const handleLoadingComplete = useCallback(() => {
    setAppState('reveal');
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          This <span className="vs">vs.</span> That
        </h1>
        <p className="app-subtitle">
          Uncover the deeply suspicious correlations between stock prices and completely unrelated things.
        </p>
      </header>

      <div className="selectors">
        <CompanyDropdown
          value={selectedTicker}
          onChange={handleCompanyChange}
          disabled={appState === 'loading'}
        />
      </div>

      {appState === 'loading' && (
        <FauxLoadingScreen
          onComplete={handleLoadingComplete}
          companyName={getCompanyName(selectedTicker)}
          dataReady={dataReady}
        />
      )}

      {appState === 'reveal' && stockData.length > 0 && currentDataset && (
        <div className="chart-section" ref={chartRef}>
          <ComparisonChart
            key={chartKey}
            stockData={stockData}
            comparisonData={comparisonData}
            stockName={getCompanyName(selectedTicker)}
            stockTicker={selectedTicker}
            comparisonName={currentDataset.name}
            comparisonEmoji={currentDataset.emoji}
            comparisonUnit={currentDataset.unit}
            comparisonSourceUrl={currentDataset.sourceUrl}
          />

          {pearson !== null && (
            <div className="pearson-card glass-card">
              <span className="pearson-score">
                Correlation: <strong>{pearson}</strong>
              </span>
              <span className="pearson-label">{pearsonLabel(pearson)}</span>
            </div>
          )}

          <PunchlineCard
            stockName={getCompanyName(selectedTicker)}
            datasetName={currentDataset.name}
            datasetEmoji={currentDataset.emoji}
            stockData={stockData}
            pearson={pearson}
          />

          <ActionButtons
            chartRef={chartRef}
          />
        </div>
      )}

      <footer className="app-footer">
        <p>Correlation ≠ Causation. But also... 🤔</p>
      </footer>
    </div>
  );
}
