import { useEffect } from 'react';
import { useSessionStore } from '../../../stores/sessionStore';
import { ipc } from '../../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';

export function useExamIntegrity() {
  const { currentSession } = useSessionStore();

  useEffect(() => {
    if (!currentSession) return;

    const logIntegrityEvent = async (type: string) => {
      try {
        await ipc(IpcChannel.FLUSH_EVENTS, {
          sessionId: currentSession.id,
          events: [{
            sessionId: currentSession.id,
            questionId: null,
            eventType: type as any,
            eventData: {},
            timestamp: new Date().toISOString(),
          }]
        });
      } catch (err) {
        // Silently fail telemetry
      }
    };

    const handleBlur = () => logIntegrityEvent('WINDOW_BLUR');
    const handleFocus = () => logIntegrityEvent('WINDOW_FOCUS');

    // Attach to window
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentSession]);
}
