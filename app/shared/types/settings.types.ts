/**
 * Settings domain types
 */

export interface AppSettings {
  /** Candidate name auto-fill */
  defaultCandidateName: string;
  /** Registration number auto-fill */
  defaultRegistrationNumber: string;
  /** Default exam language */
  defaultLanguage: string;
  /** Enable fullscreen on exam start */
  autoFullscreen: boolean;
  /** Auto-save interval in seconds */
  autoSaveIntervalSeconds: number;
  /** Show timer warning at N minutes remaining */
  timerWarningMinutes: number;
  /** Show critical timer warning at N minutes remaining */
  timerCriticalMinutes: number;
  /** Enable sound effects */
  soundEnabled: boolean;
  /** Enable keyboard shortcuts */
  keyboardShortcutsEnabled: boolean;
  /** Theme mode */
  theme: ThemeMode;
  /** Data directory path override */
  dataDirectoryPath: string | null;
  /**
   * Custom time limit for Exam mode in minutes.
   * 0 = use the test package's own duration.
   */
  examTimeLimitMinutes: number;
  /**
   * Custom time limit for Practice mode in minutes.
   * 0 = use the test package's own duration.
   */
  practiceTimeLimitMinutes: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export const DEFAULT_SETTINGS: AppSettings = {
  defaultCandidateName: '',
  defaultRegistrationNumber: '',
  defaultLanguage: 'English',
  autoFullscreen: true,
  autoSaveIntervalSeconds: 30,
  timerWarningMinutes: 15,
  timerCriticalMinutes: 5,
  soundEnabled: false,
  keyboardShortcutsEnabled: true,
  theme: 'light',
  dataDirectoryPath: null,
  examTimeLimitMinutes: 0,
  practiceTimeLimitMinutes: 0,
};
