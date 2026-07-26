/**
 * IPC Channel Types
 *
 * This is the single source of truth for all Main ↔ Renderer communication.
 * Every IPC channel is defined here with its request payload and response type.
 * This ensures compile-time safety across the process boundary.
 */

import type { Test, TestSummary, TestImportResult } from './test.types';
import type { Question } from './question.types';
import type { Session, Answer, CandidateDetails, SessionCheckpoint } from './session.types';
import type { EventBatch } from './event.types';
import type { AnalyticsReport } from './analytics.types';
import type { AppSettings } from './settings.types';
import type { Note, WrongQuestion, BookmarkWithDetails, StudyInsights } from './intelligence.types';

// ─── Channel Names ────────────────────────────────────────────────

export enum IpcChannel {
  // System
  OPEN_FILE_DIALOG = 'system:open-file-dialog',
  TOGGLE_FULLSCREEN = 'system:toggle-fullscreen',
  GET_FULLSCREEN_STATE = 'system:get-fullscreen-state',
  GET_APP_VERSION = 'system:get-app-version',
  GET_APP_PATHS = 'system:get-app-paths',

  // Import
  SELECT_IMPORT_PACKAGE = 'import:select-package',
  IMPORT_TEST_PACKAGE = 'import:import-test-package',
  IMPORT_PROGRESS = 'import:progress',         // Main → Renderer event

  // Test
  GET_ALL_TESTS = 'test:get-all',
  GET_TEST_BY_ID = 'test:get-by-id',
  GET_TEST_SUMMARY = 'test:get-summary',
  DELETE_TEST = 'test:delete',
  GET_TEST_QUESTIONS = 'test:get-questions',

  // Session
  CREATE_SESSION = 'session:create',
  GET_SESSION = 'session:get',
  UPDATE_SESSION = 'session:update',
  GET_INCOMPLETE_SESSIONS = 'session:get-incomplete',
  SAVE_ANSWER = 'session:save-answer',
  SAVE_CHECKPOINT = 'session:save-checkpoint',
  LOAD_CHECKPOINT = 'session:load-checkpoint',
  SUBMIT_SESSION = 'session:submit',

  // Events
  FLUSH_EVENTS = 'events:flush',

  // Analytics
  GENERATE_ANALYTICS = 'analytics:generate',
  GET_ANALYTICS_REPORT = 'analytics:get-report',
  GET_PROGRESS_DATA = 'analytics:get-progress',
  EXPORT_ANALYTICS_JSON = 'analytics:export-json',
  PRINT_ANALYTICS_PDF = 'analytics:print-pdf',

  // Settings
  GET_SETTINGS = 'settings:get',
  UPDATE_SETTINGS = 'settings:update',
  RESET_SETTINGS = 'settings:reset',

  // Intelligence
  TOGGLE_BOOKMARK = 'intelligence:toggle-bookmark',
  GET_BOOKMARKS = 'intelligence:get-bookmarks',
  SAVE_NOTE = 'intelligence:save-note',
  GET_NOTE = 'intelligence:get-note',
  GET_WRONG_QUESTIONS = 'intelligence:get-wrong-questions',
  GET_STUDY_INSIGHTS = 'intelligence:get-study-insights',

  // History
  GET_HISTORY = 'history:get-all',
  GET_HISTORY_ENTRY = 'history:get-entry',

  // App Lifecycle
  QUIT_APP = 'system:quit',
  RESTART_APP = 'system:restart',
  
  // Backup & Restore
  CREATE_BACKUP = 'system:create-backup',
  RESTORE_BACKUP = 'system:restore-backup',
}

// ─── IPC Type Map ─────────────────────────────────────────────────
// Maps each channel to its [RequestPayload, ResponseType]

export interface IpcChannelMap {
  // System
  [IpcChannel.OPEN_FILE_DIALOG]: [{ filters?: { name: string; extensions: string[] }[] }, string | null];
  [IpcChannel.TOGGLE_FULLSCREEN]: [void, boolean];
  [IpcChannel.GET_FULLSCREEN_STATE]: [void, boolean];
  [IpcChannel.GET_APP_VERSION]: [void, string];
  [IpcChannel.GET_APP_PATHS]: [void, { data: string; images: string; backups: string; database: string }];

  // App Lifecycle
  [IpcChannel.QUIT_APP]: [void, void];
  [IpcChannel.RESTART_APP]: [void, void];

  // Backup
  [IpcChannel.CREATE_BACKUP]: [{ destinationDir: string }, { success: boolean, path?: string, error?: string }];
  [IpcChannel.RESTORE_BACKUP]: [{ sourcePath: string }, { success: boolean, error?: string }];

  // Import
  [IpcChannel.SELECT_IMPORT_PACKAGE]: [void, string | null];
  [IpcChannel.IMPORT_TEST_PACKAGE]: [{ filePath: string }, TestImportResult];

  // Test
  [IpcChannel.GET_ALL_TESTS]: [void, TestSummary[]];
  [IpcChannel.GET_TEST_BY_ID]: [{ testId: string }, Test | null];
  [IpcChannel.GET_TEST_SUMMARY]: [{ testId: string }, TestSummary | null];
  [IpcChannel.DELETE_TEST]: [{ testId: string }, boolean];
  [IpcChannel.GET_TEST_QUESTIONS]: [{ testId: string }, Question[]];

  // Session
  [IpcChannel.CREATE_SESSION]: [{ testId: string; candidate: CandidateDetails }, Session];
  [IpcChannel.GET_SESSION]: [{ sessionId: string }, Session | null];
  [IpcChannel.UPDATE_SESSION]: [{ sessionId: string; updates: Partial<Session> }, boolean];
  [IpcChannel.GET_INCOMPLETE_SESSIONS]: [void, Session[]];
  [IpcChannel.SAVE_ANSWER]: [{ answer: Partial<Answer> & { sessionId: string; questionId: string } }, boolean];
  [IpcChannel.SAVE_CHECKPOINT]: [{ checkpoint: SessionCheckpoint }, boolean];
  [IpcChannel.LOAD_CHECKPOINT]: [{ sessionId: string }, SessionCheckpoint | null];
  [IpcChannel.SUBMIT_SESSION]: [{ sessionId: string; timeRemainingSeconds: number }, Session];

  // Events
  [IpcChannel.FLUSH_EVENTS]: [EventBatch, boolean];

  // Analytics
  [IpcChannel.GENERATE_ANALYTICS]: [{ sessionId: string }, AnalyticsReport];
  [IpcChannel.GET_ANALYTICS_REPORT]: [{ sessionId: string }, AnalyticsReport | null];
  [IpcChannel.GET_PROGRESS_DATA]: [void, any[]];
  [IpcChannel.EXPORT_ANALYTICS_JSON]: [{ sessionId: string }, { success: boolean; filePath?: string; error?: string }];
  [IpcChannel.PRINT_ANALYTICS_PDF]: [void, { success: boolean; filePath?: string; error?: string }];

  // Settings
  [IpcChannel.GET_SETTINGS]: [void, AppSettings];
  [IpcChannel.UPDATE_SETTINGS]: [Partial<AppSettings>, AppSettings];
  [IpcChannel.RESET_SETTINGS]: [void, AppSettings];

  // Intelligence
  [IpcChannel.TOGGLE_BOOKMARK]: [{ questionId: string }, { isBookmarked: boolean }];
  [IpcChannel.GET_BOOKMARKS]: [void, BookmarkWithDetails[]];
  [IpcChannel.SAVE_NOTE]: [{ questionId: string; content: string }, Note];
  [IpcChannel.GET_NOTE]: [{ questionId: string }, Note | null];
  [IpcChannel.GET_WRONG_QUESTIONS]: [{ limit?: number; offset?: number; subject?: string }, { questions: WrongQuestion[]; total: number }];
  [IpcChannel.GET_STUDY_INSIGHTS]: [void, StudyInsights];

  // History
  [IpcChannel.GET_HISTORY]: [void, import('./session.types').Session[]];
  [IpcChannel.GET_HISTORY_ENTRY]: [{ sessionId: string }, import('./session.types').Session | null];
}

/**
 * Helper types for extracting request/response from the channel map
 */
export type IpcRequest<C extends keyof IpcChannelMap> = IpcChannelMap[C][0];
export type IpcResponse<C extends keyof IpcChannelMap> = IpcChannelMap[C][1];
