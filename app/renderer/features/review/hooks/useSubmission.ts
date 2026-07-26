import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../../stores/sessionStore';
import { ipc } from '../../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';

export function useSubmission() {
  const { currentSession, timeRemainingSeconds, clearSession } = useSessionStore();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitExam = useCallback(async () => {
    if (!currentSession) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Halt autosave/timer logic by relying on isSubmitting state at the UI level
      // 2. Flush pending events
      await ipc(IpcChannel.FLUSH_EVENTS, {
        sessionId: currentSession.id,
        events: []
      });

      // 3. Submit Session (Atomic Transaction)
      await ipc(IpcChannel.SUBMIT_SESSION, {
        sessionId: currentSession.id,
        timeRemainingSeconds
      });

      // 4. Session Finalized
      const sessionId = currentSession.id;
      clearSession();
      navigate(`/results/${sessionId}`, { replace: true });
    } catch (err: any) {
      console.error('Submission failed:', err);
      setError(err?.message || 'Failed to submit exam. Please try again.');
      setIsSubmitting(false); // allow retry
    }
  }, [currentSession, timeRemainingSeconds, clearSession, navigate]);

  return {
    isSubmitting,
    error,
    submitExam
  };
}
