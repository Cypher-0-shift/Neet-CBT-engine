/**
 * Global application store
 * Tracks app-level state: loading, current route context, etc.
 */

import { create } from 'zustand';

interface AppState {
  /** Whether a global loading overlay should be shown */
  isGlobalLoading: boolean;
  /** Global loading message */
  globalLoadingMessage: string;
  /** Currently active test ID (if in exam flow) */
  activeTestId: string | null;
  /** Currently active session ID (if in exam) */
  activeSessionId: string | null;
  /** Whether the app is in fullscreen mode */
  isFullscreen: boolean;

  // Actions
  setGlobalLoading: (loading: boolean, message?: string) => void;
  setActiveTest: (testId: string | null) => void;
  setActiveSession: (sessionId: string | null) => void;
  setFullscreen: (isFullscreen: boolean) => void;
}

export const useUiStore = create<AppState>((set) => ({
  isGlobalLoading: false,
  globalLoadingMessage: '',
  activeTestId: null,
  activeSessionId: null,
  isFullscreen: false,

  setGlobalLoading: (loading, message = '') =>
    set({ isGlobalLoading: loading, globalLoadingMessage: message }),

  setActiveTest: (testId) =>
    set({ activeTestId: testId }),

  setActiveSession: (sessionId) =>
    set({ activeSessionId: sessionId }),

  setFullscreen: (isFullscreen) =>
    set({ isFullscreen }),
}));
