import { useEffect, useRef } from 'react';
import { useSessionStore } from '../../../stores/sessionStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useSubmission } from '../../review/hooks/useSubmission';

export function useExamTimerEffects() {
  const { settings } = useSettingsStore();
  const { submitExam } = useSubmission();
  const currentSessionRef = useRef(useSessionStore.getState().currentSession);
  
  useEffect(() => {
    // Keep reference updated without re-rendering
    const unsubSession = useSessionStore.subscribe((state) => {
      currentSessionRef.current = state.currentSession;
    });

    // In Zustand v5, subscribe doesn't take selector, we subscribe to the whole state
    const unsubTimer = useSessionStore.subscribe((state, prevState) => {
      const timeRemainingSeconds = state.timeRemainingSeconds;
      if (timeRemainingSeconds === prevState.timeRemainingSeconds) return;

      // Auto-submit logic
      if (timeRemainingSeconds <= 0 && currentSessionRef.current) {
        submitExam();
        return;
      }

      // Sound effects logic
      if (!settings.soundEnabled) return;

      const playBeep = (freq = 440, duration = 200) => {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.type = 'sine';
          oscillator.frequency.value = freq;
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          oscillator.start();
          setTimeout(() => oscillator.stop(), duration);
        } catch (e) {
          // Ignore audio context errors if blocked
        }
      };

      if (timeRemainingSeconds === settings.timerWarningMinutes * 60) {
        playBeep(440, 500);
      } else if (timeRemainingSeconds === settings.timerCriticalMinutes * 60) {
        playBeep(880, 500);
        setTimeout(() => playBeep(880, 500), 600);
      } else if (timeRemainingSeconds === 1) {
        playBeep(600, 1000);
      }
    });

    return () => {
      unsubSession();
      unsubTimer();
    };
  }, [settings.soundEnabled, settings.timerWarningMinutes, settings.timerCriticalMinutes, submitExam]);
}
