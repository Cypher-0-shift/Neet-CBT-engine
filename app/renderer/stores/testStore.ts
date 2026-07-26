import { create } from 'zustand';
import type { TestSummary, Question } from '@shared/types';
import { ipc } from '../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';

interface TestState {
  availableTests: TestSummary[];
  activeTestSummary: TestSummary | null;
  activeTestQuestions: Question[];
  isLoadingTests: boolean;
  isImporting: boolean;
  importProgress: { step: string; label: string; progress: number } | null;

  // Actions
  fetchAvailableTests: () => Promise<void>;
  fetchTestSummary: (testId: string) => Promise<void>;
  fetchTestQuestions: (testId: string) => Promise<void>;
  deleteTest: (testId: string) => Promise<boolean>;
  setImporting: (isImporting: boolean) => void;
  setImportProgress: (progress: { step: string; label: string; progress: number } | null) => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  availableTests: [],
  activeTestSummary: null,
  activeTestQuestions: [],
  isLoadingTests: false,
  isImporting: false,
  importProgress: null,

  fetchAvailableTests: async () => {
    set({ isLoadingTests: true });
    try {
      const tests = await ipc(IpcChannel.GET_ALL_TESTS);
      set({ availableTests: tests });
    } catch (error) {
      console.error('Failed to fetch available tests:', error);
    } finally {
      set({ isLoadingTests: false });
    }
  },

  fetchTestSummary: async (testId: string) => {
    try {
      const summary = await ipc(IpcChannel.GET_TEST_SUMMARY, { testId });
      set({ activeTestSummary: summary });
    } catch (error) {
      console.error('Failed to fetch test summary:', error);
    }
  },

  fetchTestQuestions: async (testId: string) => {
    try {
      const questions = await ipc(IpcChannel.GET_TEST_QUESTIONS, { testId });
      set({ activeTestQuestions: questions });
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  },

  deleteTest: async (testId: string) => {
    try {
      const success = await ipc(IpcChannel.DELETE_TEST, { testId });
      if (success) {
        await get().fetchAvailableTests();
      }
      return success;
    } catch (error) {
      console.error('Failed to delete test:', error);
      return false;
    }
  },

  setImporting: (isImporting) => set({ isImporting }),
  setImportProgress: (progress) => set({ importProgress: progress }),
}));
