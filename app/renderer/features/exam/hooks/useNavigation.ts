import { useCallback } from 'react';
import { useSessionStore } from '../../../stores/sessionStore';
import { useTestStore } from '../../../stores/testStore';

export function useNavigation() {
  const { currentQuestionIndex, currentSubject, setCurrentQuestion } = useSessionStore();
  const { activeTestQuestions } = useTestStore();

  const questionsBySubject = activeTestQuestions.filter(q => q.subject === currentSubject);
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questionsBySubject.length - 1;

  const navigateToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questionsBySubject.length) {
      setCurrentQuestion(index);
    }
  }, [questionsBySubject.length, setCurrentQuestion]);
  const changeSubject = useCallback((subject: string) => {
    if (subject !== currentSubject) {
      // Typically, jumping to a new subject lands you on its first question
      setCurrentQuestion(0, subject);
    }
  }, [currentSubject, setCurrentQuestion]);


  const nextQuestion = useCallback(() => {
    if (!isLastQuestion) {
      navigateToQuestion(currentQuestionIndex + 1);
    } else {
      const subjects = Array.from(new Set(activeTestQuestions.map(q => q.subject)));
      const currentSubjectIndex = subjects.indexOf(currentSubject || '');
      if (currentSubjectIndex >= 0 && currentSubjectIndex < subjects.length - 1) {
        changeSubject(subjects[currentSubjectIndex + 1]);
      }
    }
  }, [isLastQuestion, currentQuestionIndex, navigateToQuestion, activeTestQuestions, currentSubject, changeSubject]);

  const prevQuestion = useCallback(() => {
    if (!isFirstQuestion) {
      navigateToQuestion(currentQuestionIndex - 1);
    }
  }, [isFirstQuestion, currentQuestionIndex, navigateToQuestion]);


  return {
    currentQuestionIndex,
    currentSubject,
    isFirstQuestion,
    isLastQuestion,
    totalQuestionsInSubject: questionsBySubject.length,
    nextQuestion,
    prevQuestion,
    navigateToQuestion,
    changeSubject
  };
}
