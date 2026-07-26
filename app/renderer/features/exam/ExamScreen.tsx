import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '../../stores/testStore';
import { useSessionStore } from '../../stores/sessionStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { ipc } from '../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';
import { ExamHeader } from './components/ExamHeader';
import { SubjectTabs } from './components/SubjectTabs';
import { QuestionViewer } from './components/QuestionViewer';
import { QuestionPalette } from './components/QuestionPalette';
import { NavigationBar } from './components/NavigationBar';
import { useNavigation } from './hooks/useNavigation';
import { useQuestion } from './hooks/useQuestion';
import { useAutosave } from './hooks/useAutosave';
import { useExamEvents } from './hooks/useExamEvents';
import { useIntelligentTimer } from './hooks/useIntelligentTimer';
import { useExamTimerEffects } from './hooks/useExamTimerEffects';
import { useExamIntegrity } from './hooks/useExamIntegrity';
import { useSubmission } from '../review/hooks/useSubmission';
import { ExamLoader } from '../../components/ui/ExamLoader';

export function ExamScreen() {
  const navigate = useNavigate();
  const { currentSession, currentQuestionIndex, currentSubject, markQuestionVisited, recordNavigation, setCurrentQuestion, syncError } = useSessionStore();
  const { activeTestQuestions, fetchTestQuestions } = useTestStore();
  const { settings } = useSettingsStore();

  const { submitExam: submitFinalExam } = useSubmission();

  // Load questions if not loaded
  useEffect(() => {
    if (currentSession && activeTestQuestions.length === 0) {
      fetchTestQuestions(currentSession.testId);
    }
  }, [currentSession, activeTestQuestions.length, fetchTestQuestions]);

  // Set initial subject if not set
  useEffect(() => {
    if (activeTestQuestions.length > 0 && !currentSubject) {
      const subjects = Array.from(new Set(activeTestQuestions.map(q => q.subject)));
      if (subjects.length > 0) {
        setCurrentQuestion(0, subjects[0]);
      }
    }
  }, [activeTestQuestions, currentSubject, setCurrentQuestion]);

  // Activate hooks
  useIntelligentTimer();
  useAutosave(settings.autoSaveIntervalSeconds * 1000);
  useExamEvents();
  useExamIntegrity();

  // Request fullscreen
  useEffect(() => {
    const ensureFullscreen = async () => {
      if (!settings.autoFullscreen) return;
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.error('Fullscreen error', err);
      }
    };
    ensureFullscreen();
  }, [settings.autoFullscreen]);
  useExamTimerEffects();

  const {
    isFirstQuestion,
    isLastQuestion,
    nextQuestion,
    prevQuestion
  } = useNavigation();

  // Determine current question
  const questionsBySubject = activeTestQuestions.filter(q => q.subject === currentSubject);
  const currentQuestion = questionsBySubject[currentQuestionIndex];

  // The useQuestion hook provides actions for the active question
  // We handle null gracefully while loading
  const {
    selectedOptionId,
    isMarkedForReview,
    clearResponse,
    toggleReview,
    selectOption
  } = useQuestion(currentQuestion || {} as any);

  // Mark visited and record navigation when current question changes
  useEffect(() => {
    if (currentQuestion) {
      markQuestionVisited(currentQuestion.id);
      recordNavigation(currentQuestion.id);
    }
  }, [currentQuestion, markQuestionVisited, recordNavigation]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!settings.keyboardShortcutsEnabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in an input (not applicable here but good practice)
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextQuestion();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevQuestion();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          if (currentQuestion && currentQuestion.options) {
            const idx = parseInt(e.key) - 1;
            if (currentQuestion.options[idx]) {
              selectOption(currentQuestion.options[idx].id);
            }
          }
          break;
        case ' ': // Space
          e.preventDefault(); // Prevent scrolling
          if (currentQuestion) toggleReview();
          break;
        case 'Delete':
        case 'Backspace':
          if (currentQuestion) clearResponse();
          break;
        case 'Enter':
          e.preventDefault();
          nextQuestion();
          break;
        case 'Escape':
          // Optional: handle escape if needed
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, nextQuestion, prevQuestion, selectOption, toggleReview, clearResponse, isLastQuestion, settings.keyboardShortcutsEnabled]);



  const handleSaveAndNext = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  if (!currentSession || activeTestQuestions.length === 0) {
    return <ExamLoader message="Preparing your exam..." />;
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-50 overflow-hidden font-sans select-none relative">
      <ExamHeader />
      
      {syncError && (
        <div className="absolute top-14 left-0 right-0 z-50 bg-red-500 text-white text-center py-2 px-4 shadow-md text-sm font-medium animate-pulse">
          {syncError}
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <SubjectTabs />
          
          {currentQuestion ? (
            <QuestionViewer question={currentQuestion} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Loading Question...
            </div>
          )}

          <NavigationBar 
            onClearResponse={clearResponse}
            onMarkForReview={() => {
              toggleReview();
              nextQuestion();
            }}
            onPrevious={prevQuestion}
            onSaveAndNext={handleSaveAndNext}
            onSubmitExam={submitFinalExam}
            isFirstQuestion={isFirstQuestion}
            isLastQuestion={isLastQuestion}
            isReviewMarked={isMarkedForReview}
            hasAnswer={!!selectedOptionId}
          />
        </div>

        <QuestionPalette />
      </div>

      {/* We keep the dialog for manual fallback if ever needed, but NavigationBar now routes to /review directly.
          So this ConfirmationDialog is practically dead code unless triggered via hotkey/etc. 
          We'll remove it entirely since /review handles manual submission. */}
    </div>
  );
}
