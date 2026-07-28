/**
 * useAnswerSync
 *
 * Manages debounced IPC persistence for answer selections.
 *
 * Design:
 *  - The Zustand store's saveAnswer() applies the optimistic update immediately
 *    (synchronously, no IPC). This hook handles the actual persistence.
 *  - Per-question timers: each questionId gets its own 300 ms debounce so that
 *    rapidly clicking through options on the SAME question coalesces into a
 *    single IPC round-trip, but switching to a DIFFERENT question does NOT wait.
 *  - flushAll(): synchronously dispatches all pending writes and waits for them.
 *    Called before exam submission, window blur, and beforeunload.
 *  - State lives at module scope so any hook/component can call flushAll()
 *    without React prop drilling or an extra store slice.
 */

import { useEffect } from 'react';
import { useSessionStore } from '../../../stores/sessionStore';
import { ipc } from '../../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';
import type { Answer } from '@shared/types/session.types';

// ---------------------------------------------------------------------------
// Module-level pending-write registry (intentionally outside React)
// ---------------------------------------------------------------------------

interface PendingWrite {
  answer: Answer;
  timerId: ReturnType<typeof setTimeout>;
}

const pendingWrites = new Map<string, PendingWrite>();
const DEBOUNCE_MS = 300;

/**
 * Schedule a debounced IPC write for a single answer.
 * Any in-flight timer for the same questionId is cancelled and restarted.
 */
export function scheduleAnswerSync(answer: Answer): void {
  const existing = pendingWrites.get(answer.questionId);
  if (existing) {
    clearTimeout(existing.timerId);
  }

  const timerId = setTimeout(() => {
    pendingWrites.delete(answer.questionId);
    persistAnswer(answer);
  }, DEBOUNCE_MS);

  pendingWrites.set(answer.questionId, { answer, timerId });
}

/**
 * Flush all pending debounced writes immediately and await them all.
 * Safe to call multiple times (idempotent when nothing is pending).
 */
export async function flushAll(): Promise<void> {
  if (pendingWrites.size === 0) return;

  // Snapshot and clear the map before awaiting so concurrent flushAll() calls
  // don't double-send.
  const toFlush = Array.from(pendingWrites.values());
  toFlush.forEach(({ timerId }) => clearTimeout(timerId));
  pendingWrites.clear();

  await Promise.all(toFlush.map(({ answer }) => persistAnswer(answer)));
}

async function persistAnswer(answer: Answer): Promise<void> {
  try {
    await ipc(IpcChannel.SAVE_ANSWER, { answer: answer as any });
    // Clear syncError on success via store
    const store = useSessionStore.getState();
    if (store.syncError) {
      useSessionStore.setState({ syncError: null });
    }
  } catch (error) {
    console.error('Failed to persist answer:', error);
    useSessionStore.setState({
      syncError: 'Failed to sync with database. Please do not close the application.',
    });
  }
}

// ---------------------------------------------------------------------------
// React hook: wires up flush-on-navigation and flush-on-blur/beforeunload
// ---------------------------------------------------------------------------

/**
 * useAnswerSync
 *
 * Mount once inside ExamScreen (or any parent that lives for the exam lifetime).
 * Automatically flushes pending writes when:
 *   - The active question changes (navigation away from the question)
 *   - The window loses focus (blur / beforeunload)
 */
export function useAnswerSync(): void {
  const currentQuestionIndex = useSessionStore(s => s.currentQuestionIndex);
  const currentSubject = useSessionStore(s => s.currentSubject);

  // Flush when the user navigates away from the current question.
  // We only need to track question identity changes, not the answers themselves,
  // so this selector is intentionally narrow.
  useEffect(() => {
    // Flush all pending writes whenever the active question changes.
    // The previous question's debounce is cancelled and sent immediately.
    flushAll();
  }, [currentQuestionIndex, currentSubject]);

  // Flush on window blur and beforeunload.
  useEffect(() => {
    const handleUrgentFlush = () => {
      // flushAll is async but fire-and-forget here; the OS won't wait.
      // For beforeunload, the browser gives us a small window — this is
      // the same trade-off accepted by the existing SAVE_CHECKPOINT handler.
      flushAll();
    };

    window.addEventListener('blur', handleUrgentFlush);
    window.addEventListener('beforeunload', handleUrgentFlush);
    return () => {
      window.removeEventListener('blur', handleUrgentFlush);
      window.removeEventListener('beforeunload', handleUrgentFlush);
    };
  }, []);
}
