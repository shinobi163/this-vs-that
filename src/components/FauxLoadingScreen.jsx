import { useState, useEffect, useRef, useCallback } from 'react';
import { Activity } from 'lucide-react';
import loadingMessages from '../data/loadingMessages';

// ─── Progress timeline (non-linear for comedic effect) ───────────
// Each segment: [startProgress, endProgress, durationMs]
// Fast → slow → fast → agonizingly slow at the end
const PROGRESS_SEGMENTS = [
  [0, 40, 800],    // 0–40%  in 0.8s  (zippy start)
  [40, 70, 2200],  // 40–70% in 2.2s  (molasses)
  [70, 92, 1000],  // 70–92% in 1.0s  (burst of hope)
  [92, 100, 1500], // 92–100% in 1.5s (agonizingly slow crawl at the end)
];
const TOTAL_DURATION = PROGRESS_SEGMENTS.reduce((sum, [, , d]) => sum + d, 0); // 5500ms
const MESSAGE_INTERVAL = 2500; // Rotate messages every 2.5 seconds so they can be read

/**
 * FauxLoadingScreen — the comedic heart of the app.
 *
 * Displays rotating funny messages with smooth fade transitions
 * and an intentionally uneven progress bar.
 *
 * Props:
 *   onComplete  – called when the "loading" animation finishes
 *   companyName – name shown in the subtitle text
 */
export default function FauxLoadingScreen({ onComplete, companyName }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(() =>
    Math.floor(Math.random() * loadingMessages.length)
  );
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Refs for cleanup
  const animFrameRef = useRef(null);
  const messageTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const completedRef = useRef(false);

  // ─── Progress animation (non-linear) ────────────────────────────
  const animateProgress = useCallback((timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;

    // Walk through segments to find current progress value
    let currentProgress = 0;
    let accumulated = 0;

    for (const [start, end, duration] of PROGRESS_SEGMENTS) {
      if (elapsed <= accumulated + duration) {
        // We're inside this segment
        const segmentElapsed = elapsed - accumulated;
        const segmentRatio = Math.min(segmentElapsed / duration, 1);
        // Ease-in-out for each segment
        const eased = segmentRatio < 0.5
          ? 2 * segmentRatio * segmentRatio
          : 1 - Math.pow(-2 * segmentRatio + 2, 2) / 2;
        currentProgress = start + (end - start) * eased;
        break;
      }
      accumulated += duration;
      currentProgress = end;
    }

    setProgress(Math.min(currentProgress, 100));

    if (elapsed < TOTAL_DURATION) {
      animFrameRef.current = requestAnimationFrame(animateProgress);
    } else {
      // Done! Fire completion callback
      setProgress(100);
      if (!completedRef.current) {
        completedRef.current = true;
        // Tiny delay so the user sees the bar hit 100%
        setTimeout(() => onComplete(), 200);
      }
    }
  }, [onComplete]);

  // ─── Message rotation with fade ─────────────────────────────────
  const rotateMessage = useCallback(() => {
    // Fade out current message
    setIsFading(true);

    // After fade-out completes, swap the message and fade back in
    setTimeout(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      setIsFading(false);
    }, 200); // 200ms matches the CSS transition duration
  }, []);

  // ─── Mount: kick off animations ─────────────────────────────────
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(animateProgress);
    messageTimerRef.current = setInterval(rotateMessage, MESSAGE_INTERVAL);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
    };
  }, [animateProgress, rotateMessage]);

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="loading-screen">
      <div className="loading-card glass-card">
        {/* Spinning icon */}
        <div className="loading-icon-wrapper">
          <Activity size={40} className="loading-icon spin-pulse" />
        </div>

        {/* Rotating message with fade transition */}
        <div className="loading-message-wrapper">
          <p className={`loading-message ${isFading ? 'fade-out' : 'fade-in'}`}>
            {loadingMessages[currentMessageIndex]}
          </p>
        </div>

        {/* Progress section */}
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
