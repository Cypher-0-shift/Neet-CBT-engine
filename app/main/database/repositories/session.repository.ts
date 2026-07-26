/**
 * SessionRepository interface
 * Handles CRUD operations for exam sessions and answers
 */

import type { Session, Answer, SessionCheckpoint } from '../../../shared/types/session.types';

export interface SessionRepository {
  /**
   * Start a new exam session
   * @param session The session details
   */
  createSession(session: Session): Promise<void>;

  /**
   * Retrieve a session by its ID
   * @param sessionId The UUID of the session
   */
  getSessionById(sessionId: string): Promise<Session | null>;

  /**
   * Get all incomplete sessions (for resume functionality)
   */
  getIncompleteSessions(): Promise<Session[]>;

  /**
   * Abandon all incomplete sessions
   */
  abandonIncompleteSessions(): Promise<void>;

  /**
   * Get session history with optional pagination
   * @param limit Max sessions to return
   * @param offset Offset for pagination
   */
  getSessionHistory(limit?: number, offset?: number): Promise<Session[]>;

  /**
   * Update the session state (time remaining, status, etc.)
   * @param sessionId The UUID of the session
   * @param updates Partial session updates
   */
  updateSession(sessionId: string, updates: Partial<Session>): Promise<boolean>;

  /**
   * Save an answer (upsert based on questionId and sessionId)
   * @param answer The answer details
   */
  saveAnswer(answer: Answer): Promise<void>;

  /**
   * Get all answers for a specific session
   * @param sessionId The UUID of the session
   */
  getAnswersBySessionId(sessionId: string): Promise<Answer[]>;

  /**
   * Submit the session and calculate final scores
   * @param sessionId The UUID of the session
   */
  submitSession(sessionId: string): Promise<void>;

  /**
   * Save a full session checkpoint
   */
  saveCheckpoint(checkpoint: SessionCheckpoint): Promise<void>;

  /**
   * Retrieve a session checkpoint
   */
  getCheckpoint(sessionId: string): Promise<SessionCheckpoint | null>;
}
