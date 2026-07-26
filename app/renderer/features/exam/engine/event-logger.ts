/**
 * EventLogger interface
 * Captures and batches behavioural events
 */

import type { EventType } from '@shared/types/event.types';

export interface EventLogger {
  /**
   * Initializes the logger for a session
   * @param sessionId The active session UUID
   */
  initialize(sessionId: string): void;

  /**
   * Logs a new event
   * @param eventType The type of the event
   * @param questionId The current question ID (if applicable)
   * @param eventData Additional JSON-serializable data
   */
  logEvent(eventType: EventType, questionId?: string, eventData?: any): void;

  /**
   * Flushes the current memory buffer to the backend
   */
  flush(): Promise<void>;

  /**
   * Starts the background auto-flush interval
   */
  startAutoFlush(intervalMs?: number): void;

  /**
   * Stops the auto-flush interval and flushes immediately
   */
  stopAutoFlush(): Promise<void>;
}
