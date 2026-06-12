import { useState, useCallback } from 'react';
import { Shuffle, Download } from 'lucide-react';
import { captureAndDownload } from '../utils/shareUtils';

/**
 * ActionButtons — Randomize & Download controls.
 *
 * Props:
 *   onRandomize – callback to pick a new random absurd dataset
 *   chartRef    – React ref pointing to the DOM element to capture as an image
 */
export default function ActionButtons({ onRandomize, chartRef }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // ─── Randomize with spin animation ─────────────────────────────
  const handleRandomize = useCallback(() => {
    if (isSpinning) return; // prevent spamming

    setIsSpinning(true);
    onRandomize();

    // Remove spin class after animation completes
    setTimeout(() => setIsSpinning(false), 600);
  }, [onRandomize, isSpinning]);

  // ─── Download chart as PNG ──────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (isDownloading || !chartRef?.current) return;

    setIsDownloading(true);
    try {
      await captureAndDownload(chartRef.current, 'this-vs-that.png');
    } finally {
      setIsDownloading(false);
    }
  }, [chartRef, isDownloading]);

  return (
    <div className="action-buttons">
      {/* Randomize button */}
      <button
        className="action-btn neon-outline-btn"
        onClick={handleRandomize}
        title="Pick a random comparison"
      >
        <Shuffle
          size={16}
          className={`action-icon ${isSpinning ? 'icon-spin' : ''}`}
        />
        <span>Randomize Comparison</span>
      </button>

      {/* Download button */}
      <button
        className="action-btn neon-outline-btn"
        onClick={handleDownload}
        disabled={isDownloading}
        title="Download chart as PNG"
      >
        <Download size={16} className="action-icon" />
        <span>{isDownloading ? 'Saving...' : 'Download as Image'}</span>
      </button>
    </div>
  );
}
