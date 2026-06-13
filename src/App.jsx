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
  const chartRef = useRef(null);

  const getCompanyName = useCallback((ticker) => {
    const company = companies.find((c) => c.ticker === ticker);
    return company ? company.name : ticker;
  }, []);

  const pickRandomDataset = useCallback((excludeId) => {
    const filtered = absurdDatasets.filter((d) => d.id !== excludeId);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }, []);

  const runComparison = useCallback(async (ticker, datasetOverride) => {
    setAppState('loading');
    setPearson(null);

    const days = periodToDays(FIXED_PERIOD);
    const prices = await fetchStockData(ticker, days);
    setStockData(prices);

    const dataset = datasetOverride || pickRandomDataset(null);
    setCurrentDataset(dataset);

    const startDate = prices[0]?.date || new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const endDate = prices[prices.length - 1]?.date || new Date().toISOString().slice(0, 10);

    let datasetPoints = [];
    try {
      datasetPoints = await dataset.fetchFn(startDate, endDate);
    } catch (e) {
      console.warn('Dataset fetch failed:', e);
    }

    const aligned = alignDataset(prices, datasetPoints);
    const filled = interpolateNulls(aligned);

    const comparison = prices.map((p, i) => ({ date: p.date, value: filled[i] ?? 0 }));
    setComparisonData(comparison);

    const stockValues = normalise(prices.map((p) => p.price));
    const compValues = normalise(filled.map((v) => v ?? 0));
    const r = pearsonCorrelation(stockValues, compValues);
    setPearson(r);

    setChartKey((k) => k + 1);
  }, [pickRandomDataset]);

  const handleCompanyChange = useCallback((ticker) => {
    setSelectedTicker(ticker);
    if (ticker) runComparison(ticker);
  }, [runComparison]);

  const handleLoadingComplete = useCallback(() => {
    setAppState('reveal');
  }, []);

  const handleRandomize = useCallback(() => {
    const newDataset = pickRandomDataset(currentDataset?.id);
    runComparison(selectedTicker, newDataset);
  }, [selectedTicker, currentDataset, pickRandomDataset, runComparison]);

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
            onRandomize={handleRandomize}
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
