import { useCallback } from 'react';
import { useSessionStore } from '../../../stores/sessionStore';
import type { Question } from '@shared/types';

export function useQuestion(question: Question) {
  const { answers, saveAnswer, toggleReviewFlag, reviewFlags } = useSessionStore();

  const answer = answers[question.id];
  const selectedOptionId = answer?.selectedOptionId || null;
  const isMarkedForReview = reviewFlags.has(question.id);

  const selectOption = useCallback((optionId: string) => {
    saveAnswer(question.id, { selectedOptionId: optionId });
  }, [question.id, saveAnswer]);

  const clearResponse = useCallback(() => {
    saveAnswer(question.id, { selectedOptionId: null });
  }, [question.id, saveAnswer]);

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
