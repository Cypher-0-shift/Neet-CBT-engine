import { useMemo } from 'react';
import { useSessionStore } from '../../../stores/sessionStore';
import { useTestStore } from '../../../stores/testStore';

export interface SubjectStats {
  subject: string;
  totalQuestions: number;
  answered: number;
  notAnswered: number;
  markedForReview: number;
  answeredAndMarkedForReview: number;
  notVisited: number;
}

export interface ReviewStats {
  totalQuestions: number;
  answered: number;
  notAnswered: number;
  markedForReview: number;
  answeredAndMarkedForReview: number;
  notVisited: number;
  subjects: SubjectStats[];
}

export function useReviewStats(): ReviewStats {
  const { answers, reviewFlags, visitedQuestions } = useSessionStore();
  const { activeTestQuestions } = useTestStore();

  return useMemo(() => {
    const subjectsMap = new Map<string, SubjectStats>();

    const totalStats = {
      totalQuestions: activeTestQuestions.length,
      answered: 0,
      notAnswered: 0,
      markedForReview: 0,
      answeredAndMarkedForReview: 0,
      notVisited: 0,
    };

    activeTestQuestions.forEach(q => {
      // Initialize subject stats if not present
      if (!subjectsMap.has(q.subject)) {
        subjectsMap.set(q.subject, {
          subject: q.subject,
          totalQuestions: 0,
          answered: 0,
          notAnswered: 0,
          markedForReview: 0,
          answeredAndMarkedForReview: 0,
          notVisited: 0,
        });
      }

      const subjectStats = subjectsMap.get(q.subject)!;
      subjectStats.totalQuestions++;

      const isVisited = visitedQuestions.has(q.id);
      const isAnswered = !!answers[q.id]?.selectedOptionId;
      const isMarked = reviewFlags.has(q.id);

      if (!isVisited) {
        subjectStats.notVisited++;
        totalStats.notVisited++;
      } else if (isAnswered && isMarked) {
        subjectStats.answeredAndMarkedForReview++;
        totalStats.answeredAndMarkedForReview++;
      } else if (isAnswered && !isMarked) {
        subjectStats.answered++;
        totalStats.answered++;
      } else if (!isAnswered && isMarked) {
        subjectStats.markedForReview++;
        totalStats.markedForReview++;
      } else if (!isAnswered && !isMarked) {
        subjectStats.notAnswered++;
        totalStats.notAnswered++;
      }
    });

    return {
      ...totalStats,
      subjects: Array.from(subjectsMap.values()),
    };
  }, [activeTestQuestions, answers, reviewFlags, visitedQuestions]);
}
