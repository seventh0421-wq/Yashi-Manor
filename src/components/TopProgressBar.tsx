import { useEffect, useState, useRef } from 'react';

interface TopProgressBarProps {
  /** Optional key that triggers the progress bar when changed (e.g. activeTab) */
  triggerKey?: string;
}

export function TopProgressBar({ triggerKey }: TopProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = () => {
    // Clear any existing timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    setVisible(true);
    setProgress(20);

    // Natural staggered loading progression
    let current = 20;
    timerRef.current = setInterval(() => {
      current += Math.random() * 18 + 8;
      if (current >= 90) {
        current = 90;
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setProgress(Math.min(current, 90));
    }, 120);

    // Auto-complete if no explicit complete event is triggered
    completeTimerRef.current = setTimeout(() => {
      completeProgress();
    }, 450);
  };

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setProgress(0);
      }, 300);
    }, 280);
  };

  // Trigger on prop triggerKey change (page tab switch)
  useEffect(() => {
    if (triggerKey !== undefined) {
      startProgress();
    }
  }, [triggerKey]);

  // Listen to global custom events so any image or action can trigger it
  useEffect(() => {
    const handleStart = () => startProgress();
    const handleComplete = () => completeProgress();

    window.addEventListener('app:start-progress', handleStart);
    window.addEventListener('app:complete-progress', handleComplete);

    return () => {
      window.removeEventListener('app:start-progress', handleStart);
      window.removeEventListener('app:complete-progress', handleComplete);
      if (timerRef.current) clearInterval(timerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      id="top-progress-bar-container"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Slim Pale-Blue Gradient Track & Bar */}
      <div
        id="top-progress-bar"
        className="h-[3px] sm:h-[3.5px] bg-gradient-to-r from-[#BAE6FD] via-[#7DD3FC] to-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.8),0_0_4px_rgba(186,230,253,0.9)] relative transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      >
        {/* Leading Sparkling Light Accent at the edge */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/80 to-white blur-[0.5px] rounded-full" />
        <div className="absolute -right-1 -top-[1.5px] w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full shadow-[0_0_8px_#38bdf8] animate-ping opacity-75" />
      </div>
    </div>
  );
}
