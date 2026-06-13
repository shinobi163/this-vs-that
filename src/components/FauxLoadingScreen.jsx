import { useState, useEffect, useRef, useCallback } from 'react';
import { Activity } from 'lucide-react';
import loadingMessages from '../data/loadingMessages';

const PROGRESS_SEGMENTS = [
  [0, 40, 800],
  [40, 70, 2200],
  [70, 92, 1000],
  [92, 99, 1500],
];
const TOTAL_DURATION = PROGRESS_SEGMENTS.reduce((sum, [, , d]) => sum + d, 0);
const MESSAGE_INTERVAL = 2500;

export default function FauxLoadingScreen({ onComplete, companyName, dataReady }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(() =>
    Math.floor(Math.random() * loadingMessages.length)
  );
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const animFrameRef = useRef(null);
  const messageTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const completedRef = useRef(false);
  const animationDoneRef = useRef(false);
  const dataReadyRef = useRef(dataReady);

  // Keep ref in sync with prop so the animation callback can read latest value
  useEffect(() => {
    dataReadyRef.current = dataReady;
    // If animation already finished and was waiting for data, complete now
    if (dataReady && animationDoneRef.current && !completedRef.current) {
      completedRef.current = true;
      setTimeout(() => onComplete(), 200);
    }
  }, [dataReady, onComplete]);

  const animateProgress = useCallback((timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;

    let currentProgress = 0;
    let accumulated = 0;

    for (const [start, end, duration] of PROGRESS_SEGMENTS) {
      if (elapsed <= accumulated + duration) {
        const segmentElapsed = elapsed - accumulated;
        const segmentRatio = Math.min(segmentElapsed / duration, 1);
        const eased = segmentRatio < 0.5
          ? 2 * segmentRatio * segmentRatio
          : 1 - Math.pow(-2 * segmentRatio + 2, 2) / 2;
        currentProgress = start + (end - start) * eased;
        break;
      }
      accumulated += duration;
      currentProgress = end;
    }

    // Cap at 99% until data is ready — bar will jump to 100% when data arrives
    const cap = dataReadyRef.current ? 100 : 99;
    setProgress(Math.min(currentProgress, cap));

    if (elapsed < TOTAL_DURATION) {
      animFrameRef.current = requestAnimationFrame(animateProgress);
    } else {
      // Animation finished — check if data is ready
      animationDoneRef.current = true;
      if (dataReadyRef.current) {
        setProgress(100);
        if (!completedRef.current) {
          completedRef.current = true;
          setTimeout(() => onComplete(), 200);
        }
      } else {
        // Data not ready yet — hold at 99% and pulse until dataReady prop fires
        setProgress(99);
      }
    }
  }, [onComplete]);

  const rotateMessage = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      setIsFading(false);
    }, 200);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(animateProgress);
    messageTimerRef.current = setInterval(rotateMessage, MESSAGE_INTERVAL);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
    };
  }, [animateProgress, rotateMessage]);

  return (
    <div className="loading-screen">
      <div className="loading-card glass-card">
        <div className="loading-icon-wrapper">
          <Activity size={40} className="loading-icon spin-pulse" />
        </div>

        <div className="loading-message-wrapper">
          <p className={`loading-message ${isFading ? 'fade-out' : 'fade-in'}`}>
            {loadingMessages[currentMessageIndex]}
          </p>
        </div>

        <div className="loading-progress-container">
          <span className="loading-analyzing">
            Analyzing <strong>{companyName || 'data'}</strong>...
          </span>

          <div className="loading-progress-track">
            <div
              className="loading-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="progress-percentage">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
