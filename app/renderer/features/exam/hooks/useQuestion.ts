import { useCallback } from 'react';
import { useSessionStore } from '../../../stores/sessionStore';
import { scheduleAnswerSync } from './useAnswerSync';
import type { Question } from '@shared/types';

export function useQuestion(question: Question) {
  const answers = useSessionStore(s => s.answers);
  const reviewFlags = useSessionStore(s => s.reviewFlags);
  const saveAnswer = useSessionStore(s => s.saveAnswer);
  const toggleReviewFlag = useSessionStore(s => s.toggleReviewFlag);
  const currentSession = useSessionStore(s => s.currentSession);

  const answer = answers[question.id];
  const selectedOptionId = answer?.selectedOptionId || null;
  const isMarkedForReview = reviewFlags.has(question.id);

  const selectOption = useCallback((optionId: string) => {
    // 1. Optimistic update — synchronous, no re-render from isSaving
    saveAnswer(question.id, { selectedOptionId: optionId });
    // 2. Schedule debounced IPC write (300 ms, flushed on navigation/blur/submit)
    if (currentSession) {
      const latestAnswers = useSessionStore.getState().answers;
      const answer = latestAnswers[question.id];
      if (answer) scheduleAnswerSync(answer);
    }
  }, [question.id, saveAnswer, currentSession]);

  const clearResponse = useCallback(() => {
    saveAnswer(question.id, { selectedOptionId: null });
    if (currentSession) {
      const latestAnswers = useSessionStore.getState().answers;
      const answer = latestAnswers[question.id];
      if (answer) scheduleAnswerSync(answer);
    }
  }, [question.id, saveAnswer, currentSession]);

  const toggleReview = useCallback(() => {
    toggleReviewFlag(question.id);
  }, [question.id, toggleReviewFlag]);

  return {
    selectedOptionId,
    isMarkedForReview,
    selectOption,
    clearResponse,
    toggleReview
  };
}
