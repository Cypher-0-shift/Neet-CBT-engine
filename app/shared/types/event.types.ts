/**
 * Event domain types
 * Every user interaction during an exam is captured as an event
 */

export enum EventType {
  // Session lifecycle
  SESSION_STARTED = 'SESSION_STARTED',
  SESSION_PAUSED = 'SESSION_PAUSED',
  SESSION_RESUMED = 'SESSION_RESUMED',
  SESSION_SUBMITTED = 'SESSION_SUBMITTED',
  SESSION_AUTO_SUBMITTED = 'SESSION_AUTO_SUBMITTED',

  // Question navigation
  QUESTION_OPENED = 'QUESTION_OPENED',
  QUESTION_CLOSED = 'QUESTION_CLOSED',
  QUESTION_REVISITED = 'QUESTION_REVISITED',

  // Answer actions
  OPTION_SELECTED = 'OPTION_SELECTED',
  OPTION_CHANGED = 'OPTION_CHANGED',
  OPTION_CLEARED = 'OPTION_CLEARED',

  // Review actions
  MARKED_FOR_REVIEW = 'MARKED_FOR_REVIEW',
  UNMARKED_FOR_REVIEW = 'UNMARKED_FOR_REVIEW',

  // Navigation
  SAVE_AND_NEXT = 'SAVE_AND_NEXT',
  PREVIOUS = 'PREVIOUS',
  SUBJECT_SWITCHED = 'SUBJECT_SWITCHED',
  PALETTE_JUMP = 'PALETTE_JUMP',

  // Behavioural
  IDLE_DETECTED = 'IDLE_DETECTED',
  FULLSCREEN_EXITED = 'FULLSCREEN_EXITED',
  FULLSCREEN_ENTERED = 'FULLSCREEN_ENTERED',
  WINDOW_FOCUS_LOST = 'WINDOW_FOCUS_LOST',
  WINDOW_FOCUS_GAINED = 'WINDOW_FOCUS_GAINED',

  // System
  AUTO_SAVED = 'AUTO_SAVED',
  TIME_WARNING = 'TIME_WARNING',
  CHECKPOINT_SAVED = 'CHECKPOINT_SAVED',
}

export interface ExamEvent {
  id: string;
  sessionId: string;
  questionId: string | null;
  eventType: EventType;
  eventData: Record<string, unknown>;
  timestamp: string;
  sequenceNumber: number;
}

/**
 * Lightweight event for batching before DB flush
 */
export interface PendingEvent {
  sessionId: string;
  questionId: string | null;
  eventType: EventType;
  eventData: Record<string, unknown>;
  timestamp: string;
}

/**
 * Event batch sent from renderer to main via IPC
 */
export interface EventBatch {
  sessionId: string;
  events: PendingEvent[];
}
