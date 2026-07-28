import { useEffect } from 'react';
import { useSessionStore } from '../../../stores/sessionStore';
import { ipc } from '../../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';

export function useExamEvents() {
  const currentQuestionIndex = useSessionStore(s => s.currentQuestionIndex);
  const currentSubject = useSessionStore(s => s.currentSubject);
  const currentSession = useSessionStore(s => s.currentSession);

  useEffect(() => {
    if (!currentSession || !currentSubject) return;

    // A real implementation would capture exact timestamps and diffs
    // between question opens, closes, option clicks, etc.
    const logEvent = async (type: string, data: any) => {
      try {
        await ipc(IpcChannel.FLUSH_EVENTS, {
          sessionId: currentSession.id,
          events: [{
            type,
            timestamp: new Date().toISOString(),
            ...data
          }]
        });
      } catch (err) {
        // Silently fail for telemetry
      }
    };

    logEvent('QUESTION_OPEN', { currentQuestionIndex, currentSubject });

    return () => {
      logEvent('QUESTION_CLOSE', { currentQuestionIndex, currentSubject });
    };
  }, [currentQuestionIndex, currentSubject, currentSession]);
}
