import { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { captureAndDownload } from '../utils/shareUtils';

export default function ActionButtons({ chartRef }) {
  const [isDownloading, setIsDownloading] = useState(false);

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
