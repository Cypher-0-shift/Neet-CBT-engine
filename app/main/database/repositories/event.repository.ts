/**
 * EventRepository interface
 * Handles persistence of behavioural tracking events
 */

import type { ExamEvent } from '../../../shared/types/event.types';

export interface EventRepository {
  /**
   * Store a batch of events (efficient bulk insert)
   * @param events Array of exam events
   */
  saveEvents(events: ExamEvent[]): Promise<void>;

  /**
   * Retrieve events for a specific session
   * @param sessionId The UUID of the session
   */
  getEventsBySessionId(sessionId: string): Promise<ExamEvent[]>;

  /**
   * Retrieve a specific type of event for a session
   * @param sessionId The UUID of the session
   * @param eventType The specific event type to filter by
   */
  getEventsByType(sessionId: string, eventType: string): Promise<ExamEvent[]>;
}
