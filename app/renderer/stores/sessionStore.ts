import { create } from 'zustand';
import type { Session, Answer, CandidateDetails } from '@shared/types/session.types';
import { ipc } from '../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';

interface SessionState {
  currentSession: Session | null;
  answers: Record<string, Answer>; // questionId -> Answer
  reviewFlags: Set<string>;
  visitedQuestions: Set<string>;
  timeRemainingSeconds: number;
  currentSubject: string | null;
  currentQuestionIndex: number;
  navigationHistory: import('@shared/types/session.types').NavigationEvent[];
  isSubmitting: boolean;
  syncError: string | null;

  // Actions
  createSession: (testId: string, candidate: CandidateDetails) => Promise<void>;
  resumeSession: (sessionId: string) => Promise<void>;
  /**
   * Applies the optimistic UI update for an answer synchronously.
   * The actual IPC write is handled by useAnswerSync (debounced, 300 ms).
   */
  saveAnswer: (questionId: string, answer: Partial<Answer>) => void;
  toggleReviewFlag: (questionId: string) => void;
  markQuestionVisited: (questionId: string) => void;
  setCurrentQuestion: (index: number, subject?: string) => void;
  recordNavigation: (questionId: string) => void;
  setTimeRemaining: (seconds: number) => void;
  submitExam: () => Promise<void>;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  answers: {},
  reviewFlags: new Set(),
  visitedQuestions: new Set(),
  timeRemainingSeconds: 0,
  currentSubject: null,
  currentQuestionIndex: 0,
  navigationHistory: [],
  isSubmitting: false,
  syncError: null,

  createSession: async (testId: string, candidate: CandidateDetails) => {
    try {
      const session = await ipc(IpcChannel.CREATE_SESSION, { testId, candidate });
      set({ 
        currentSession: session,
        timeRemainingSeconds: session.durationSeconds,
        answers: {},
        reviewFlags: new Set(),
        visitedQuestions: new Set(),
        currentQuestionIndex: 0,
        currentSubject: null,
        navigationHistory: []
      });
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },

  resumeSession: async (sessionId: string) => {
    try {
      const checkpoint = await ipc(IpcChannel.LOAD_CHECKPOINT, { sessionId });
      const session = await ipc(IpcChannel.GET_SESSION, { sessionId });
      
      if (session && checkpoint) {
        set({
          currentSession: session,
          timeRemainingSeconds: checkpoint.timeRemainingSeconds,
          reviewFlags: new Set(checkpoint.markedForReview),
          visitedQuestions: new Set(checkpoint.visitedQuestions),
          currentQuestionIndex: checkpoint.currentQuestionIndex,
          currentSubject: checkpoint.currentSubject,
          navigationHistory: checkpoint.navigationHistory || []
        });
        // Note: Full answer hydration requires fetching answers, which depends on backend impl.
      }
    } catch (error) {
      console.error('Failed to resume session:', error);
      throw error;
    }
  },

  /**
   * Synchronous optimistic update only.
   * The IPC write is handled externally by useAnswerSync so it can be debounced
   * without toggling any store boolean on every keystroke.
   */
  saveAnswer: (questionId: string, answerData: Partial<Answer>) => {
    const { currentSession, answers } = get();
    if (!currentSession) return;

    const newAnswer: Answer = {
      ...answers[questionId],
      ...answerData,
      sessionId: currentSession.id,
      questionId,
    };

    set(state => ({
      answers: {
        ...state.answers,
        [questionId]: newAnswer,
      },
    }));
  },

  toggleReviewFlag: (questionId: string) => {
    set(state => {
      const newFlags = new Set(state.reviewFlags);
      if (newFlags.has(questionId)) {
        newFlags.delete(questionId);
      } else {
        newFlags.add(questionId);
      }
      return { reviewFlags: newFlags };
    });
  },

  markQuestionVisited: (questionId: string) => {
    set(state => {
      const newVisited = new Set(state.visitedQuestions);
      newVisited.add(questionId);
      return { visitedQuestions: newVisited };
    });
  },

  setCurrentQuestion: (index: number, subject?: string) => {
    set(state => ({
      currentQuestionIndex: index,
      currentSubject: subject || state.currentSubject
    }));
  },

  recordNavigation: (questionId: string) => {
    set(state => {
      const now = new Date().toISOString();
      const newEvent = { questionId, timestamp: now };
      
      // Calculate duration of the previous event
      const history = [...state.navigationHistory];
      if (history.length > 0) {
        const lastEvent = history[history.length - 1];
        const duration = (new Date(now).getTime() - new Date(lastEvent.timestamp).getTime()) / 1000;
        lastEvent.durationSeconds = duration;
      }
      
      history.push(newEvent);
      return { navigationHistory: history };
    });
  },

  setTimeRemaining: (seconds: number) => {
    set({ timeRemainingSeconds: seconds });
  },

  submitExam: async () => {
    const { currentSession, timeRemainingSeconds, isSubmitting } = get();
    if (!currentSession || isSubmitting) return;
    
    set({ isSubmitting: true });
    try {
      await ipc(IpcChannel.SUBMIT_SESSION, { 
        sessionId: currentSession.id,
        timeRemainingSeconds
      });
    } catch (error) {
      console.error('Failed to submit exam:', error);
      set({ isSubmitting: false });
      throw error;
    }
  },

  clearSession: () => {
    set({
      currentSession: null,
      answers: {},
      reviewFlags: new Set(),
      visitedQuestions: new Set(),
      timeRemainingSeconds: 0,
      currentSubject: null,
      currentQuestionIndex: 0,
      navigationHistory: [],
      isSubmitting: false,
      syncError: null
    });
  }
}));
