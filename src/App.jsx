import { useState, useRef, useCallback } from 'react';
import CompanyDropdown from './components/CompanyDropdown';
import TimePeriodDropdown from './components/TimePeriodDropdown';
import FauxLoadingScreen from './components/FauxLoadingScreen';
import ComparisonChart from './components/ComparisonChart';
import PunchlineCard from './components/PunchlineCard';
import ActionButtons from './components/ActionButtons';
import { fetchStockData, periodToDays } from './api/stockApi';
import { generateAbsurdTrend } from './data/trendGenerator';
import absurdDatasets from './data/absurdDatasets';
import companies from './data/companies';

/**
 * App states:
 *  - idle: waiting for user to pick both dropdowns
 *  - loading: faux loading screen with funny messages
 *  - reveal: chart + punchline + action buttons
 */
export default function App() {
  const [selectedTicker, setSelectedTicker] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [appState, setAppState] = useState('idle'); // 'idle' | 'loading' | 'reveal'
  const [stockData, setStockData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [currentDataset, setCurrentDataset] = useState(null);
  const [chartKey, setChartKey] = useState(0); // force re-mount for animation replay
  const chartRef = useRef(null);

  // Get company name from ticker
  const getCompanyName = useCallback((ticker) => {
    const company = companies.find((c) => c.ticker === ticker);
    return company ? company.name : ticker;
  }, []);

  // Pick a random absurd dataset (different from current)
  const pickRandomDataset = useCallback(
    (excludeId) => {
      const filtered = absurdDatasets.filter((d) => d.id !== excludeId);
      return filtered[Math.floor(Math.random() * filtered.length)];
    },
    []
  );

  // Core: fetch stock data and generate comparison
  const runComparison = useCallback(
    async (ticker, period, datasetOverride) => {
      setAppState('loading');

      // Fetch stock data while loading screen plays
      const days = periodToDays(period);
      const prices = await fetchStockData(ticker, days);
      setStockData(prices);

      // Pick absurd dataset
      const dataset = datasetOverride || pickRandomDataset(null);
      setCurrentDataset(dataset);

      // Generate matching trend
      const fakeTrend = generateAbsurdTrend(prices, dataset);
      setComparisonData(fakeTrend);

      // Force chart re-mount for animation
      setChartKey((k) => k + 1);
    },
    [pickRandomDataset]
  );

  // Handle dropdown changes
  const handleCompanyChange = useCallback(
    (ticker) => {
      setSelectedTicker(ticker);
      if (ticker && selectedPeriod) {
        runComparison(ticker, selectedPeriod);
      }
    },
    [selectedPeriod, runComparison]
  );

  const handlePeriodChange = useCallback(
    (period) => {
      setSelectedPeriod(period);
      if (selectedTicker && period) {
        runComparison(selectedTicker, period);
      }
    },
    [selectedTicker, runComparison]
  );

  // Loading complete → reveal
  const handleLoadingComplete = useCallback(() => {
    setAppState('reveal');
  }, []);

  // Randomize: pick new dataset, re-run loading → reveal
  const handleRandomize = useCallback(() => {
    const newDataset = pickRandomDataset(currentDataset?.id);
    runComparison(selectedTicker, selectedPeriod, newDataset);
  }, [selectedTicker, selectedPeriod, currentDataset, pickRandomDataset, runComparison]);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">
          This <span className="vs">vs.</span> That
        </h1>
        <p className="app-subtitle">
          Uncover the deeply suspicious correlations between stock prices and completely unrelated things.
        </p>
      </header>

      {/* Selectors */}
      <div className="selectors">
        <CompanyDropdown
          value={selectedTicker}
          onChange={handleCompanyChange}
          disabled={appState === 'loading'}
        />
        <TimePeriodDropdown
          value={selectedPeriod}
          onChange={handlePeriodChange}
          disabled={appState === 'loading'}
        />
      </div>

      {/* Loading Screen */}
      {appState === 'loading' && (
        <FauxLoadingScreen
          onComplete={handleLoadingComplete}
          companyName={getCompanyName(selectedTicker)}
        />
      )}

      {/* Reveal: Chart + Punchline + Actions */}
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

          <PunchlineCard
            stockName={getCompanyName(selectedTicker)}
            datasetName={currentDataset.name}
            datasetEmoji={currentDataset.emoji}
            stockData={stockData}
          />

          <ActionButtons
            onRandomize={handleRandomize}
            chartRef={chartRef}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Correlation ≠ Causation. But also... 🤔
        </p>
      </footer>
    </div>
  );
}
