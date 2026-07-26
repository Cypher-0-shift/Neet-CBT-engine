/**
 * SessionManager interface
 * Handles creating, loading, and persisting exam sessions
 */

import type { Session, CandidateDetails } from '@shared/types/session.types';

export interface SessionManager {
  /**
   * Creates a new session
   * @param testId The UUID of the test
   * @param details The candidate details
   */
  createSession(testId: string, details: CandidateDetails): Promise<Session>;

  /**
   * Loads an existing session
   * @param sessionId The UUID of the session
   */
  loadSession(sessionId: string): Promise<Session | null>;

  /**
   * Submits a session and transitions it to completed state
   * @param sessionId The UUID of the session
   */
  submitSession(sessionId: string): Promise<void>;
}
