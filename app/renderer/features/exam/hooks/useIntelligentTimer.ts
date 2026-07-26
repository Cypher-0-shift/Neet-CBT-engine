import { useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '../../../stores/sessionStore';

const WARNING_THRESHOLDS = [
  { threshold: 60 * 60, message: '60 minutes remaining.' },
  { threshold: 30 * 60, message: '30 minutes remaining.' },
  { threshold: 10 * 60, message: '10 minutes remaining.' },
  { threshold: 5 * 60, message: '5 minutes remaining.' },
  { threshold: 60, message: '1 minute remaining!' },
  { threshold: 30, message: '30 seconds remaining!' },
  { threshold: 10, message: '10 seconds remaining! Prepare for auto-submit.' }
];

export function useIntelligentTimer() {
  const { currentSession, timeRemainingSeconds, setTimeRemaining } = useSessionStore();
  
  const initialTimeLeft = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const lastWarningIndex = useRef<number>(-1);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const checkWarnings = useCallback((timeLeft: number) => {
    const nextWarning = WARNING_THRESHOLDS.findIndex(w => timeLeft <= w.threshold);
    if (nextWarning !== -1 && nextWarning > lastWarningIndex.current) {
      lastWarningIndex.current = nextWarning;
      // In a real app, this would trigger a toast notification system.
      // E.g., toast.warn(WARNING_THRESHOLDS[nextWarning].message);
      console.warn('TIMER WARNING:', WARNING_THRESHOLDS[nextWarning].message);
    }
  }, []);

  useEffect(() => {
    if (!currentSession || currentSession.status === 'SUBMITTED' || currentSession.status === 'TIME_UP') {
      if (intervalId.current) clearInterval(intervalId.current);
      return;
    }

    // Initialize timer anchors
    if (initialTimeLeft.current === null) {
      initialTimeLeft.current = timeRemainingSeconds;
      startTime.current = Date.now();
      
      // Determine initial warning state so we don't spam missed warnings if resuming a session
      lastWarningIndex.current = WARNING_THRESHOLDS.findIndex(w => timeRemainingSeconds <= w.threshold);
      if (lastWarningIndex.current > 0) {
        lastWarningIndex.current--; // Ensure we show the current bracket if exact match
      }
    }

    const tick = () => {
      if (initialTimeLeft.current === null || startTime.current === null) return;
      
      const elapsedMilliseconds = Date.now() - startTime.current;
      const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
      const newTimeLeft = Math.max(0, initialTimeLeft.current - elapsedSeconds);
      
      if (newTimeLeft !== timeRemainingSeconds) {
        setTimeRemaining(newTimeLeft);
        checkWarnings(newTimeLeft);
      }

      if (newTimeLeft <= 0) {
        if (intervalId.current) clearInterval(intervalId.current);
      }
    };

    intervalId.current = setInterval(tick, 200); // Check every 200ms for precision and drift resilience

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [currentSession, timeRemainingSeconds, setTimeRemaining, checkWarnings]);

  // Clean up refs when session is cleared
  useEffect(() => {
    if (!currentSession) {
      initialTimeLeft.current = null;
      startTime.current = null;
      lastWarningIndex.current = -1;
    }
  }, [currentSession]);
}
