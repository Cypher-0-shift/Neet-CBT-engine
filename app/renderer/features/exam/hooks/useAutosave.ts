import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';
import { useSessionStore } from '../../../stores/sessionStore';
import { flushAll } from './useAnswerSync';
import { ipc } from '../../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';
import type { SessionCheckpoint } from '@shared/types/session.types';

export function useAutosave(intervalMs = 15000) {
  const {
    currentSession,
    currentQuestionIndex,
    currentSubject,
    timeRemainingSeconds,
    answers,
    reviewFlags,
    visitedQuestions,
    navigationHistory,
  } = useSessionStore(
    useShallow(s => ({
      currentSession: s.currentSession,
      currentQuestionIndex: s.currentQuestionIndex,
      currentSubject: s.currentSubject,
      timeRemainingSeconds: s.timeRemainingSeconds,
      answers: s.answers,
      reviewFlags: s.reviewFlags,
      visitedQuestions: s.visitedQuestions,
      navigationHistory: s.navigationHistory,
    }))
  );

  const lastSavedCheckpoint = useRef<string | null>(null);
  const saveTimeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!currentSession || !currentSubject) return;

    const saveCheckpoint = async (isUrgent = false) => {
      // Build simplified answers map for checkpoint
      const simpleAnswers: Record<string, string | null> = {};
      Object.keys(answers).forEach(qId => {
        simpleAnswers[qId] = answers[qId].selectedOptionId;
      });

      const checkpoint: SessionCheckpoint = {
        sessionId: currentSession.id,
        currentQuestionIndex,
        currentSubject,
        timeRemainingSeconds,
        answers: simpleAnswers,
        markedForReview: Array.from(reviewFlags),
        visitedQuestions: Array.from(visitedQuestions),
        navigationHistory,
        timestamp: new Date().toISOString(),
        appVersion: '1.0.0', // from config or globals typically
      };

      // Stringify to diff
      const checkpointString = JSON.stringify({
        qIdx: checkpoint.currentQuestionIndex,
        subj: checkpoint.currentSubject,
        ans: checkpoint.answers,
        rev: checkpoint.markedForReview,
        vis: checkpoint.visitedQuestions,
        histLen: checkpoint.navigationHistory.length
      });

      if (isUrgent || lastSavedCheckpoint.current !== checkpointString) {
        try {
          await ipc(IpcChannel.SAVE_CHECKPOINT, { checkpoint });
          lastSavedCheckpoint.current = checkpointString;
        } catch (error) {
          console.error('Autosave checkpoint failed:', error);
        }
      }
    };

    // Trigger save immediately if it's a significant change, but debounce it
    if (saveTimeoutId.current) clearTimeout(saveTimeoutId.current);
    saveTimeoutId.current = setTimeout(() => {
      saveCheckpoint();
    }, 1000); // Debounce frequent clicks by 1 second

    // Interval safety net
    const intervalId = setInterval(() => saveCheckpoint(true), intervalMs);

    return () => {
      if (saveTimeoutId.current) clearTimeout(saveTimeoutId.current);
      clearInterval(intervalId);
    };
  }, [
    currentSession,
    currentQuestionIndex,
    currentSubject,
    answers,
    reviewFlags,
    visitedQuestions,
    navigationHistory,
    intervalMs
    // Exclude timeRemainingSeconds
  ]);

  // Window blur hook for urgent save
  useEffect(() => {
    const handleBlur = async () => {
      if (currentSession && currentSubject) {
        // 1. Flush pending answer writes first so the checkpoint is consistent
        //    with what has been persisted.
        await flushAll();

        // 2. Save checkpoint
        const simpleAnswers: Record<string, string | null> = {};
        Object.keys(answers).forEach(qId => {
          simpleAnswers[qId] = answers[qId].selectedOptionId;
        });

        const checkpoint: SessionCheckpoint = {
          sessionId: currentSession.id,
          currentQuestionIndex,
          currentSubject,
          timeRemainingSeconds,
          answers: simpleAnswers,
          markedForReview: Array.from(reviewFlags),
          visitedQuestions: Array.from(visitedQuestions),
          navigationHistory,
          timestamp: new Date().toISOString()
        };
        ipc(IpcChannel.SAVE_CHECKPOINT, { checkpoint }).catch(e => console.error(e));
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBlur);
    };
  }, [currentSession, currentSubject, currentQuestionIndex, timeRemainingSeconds, answers, reviewFlags, visitedQuestions, navigationHistory]);
}
