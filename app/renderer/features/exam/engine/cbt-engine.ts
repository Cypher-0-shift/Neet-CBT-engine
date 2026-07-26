/**
 * CBTEngine interface
 * The core exam state machine and orchestrator
 */

import type { Session, Answer } from '@shared/types/session.types';

export interface CBTEngine {
  /**
   * Initializes the engine with session data
   */
  initialize(session: Session, answers: Answer[]): void;

  /**
   * Starts or resumes the exam
   */
  start(): void;

  /**
   * Pauses the exam (saves state)
   */
  pause(): void;

  /**
   * Submits the final exam
   */
  submit(): Promise<void>;

  /**
   * Saves the current answer for the active question
   */
  saveCurrentAnswer(optionId: string | null, isMarkedForReview: boolean): Promise<void>;

  /**
   * Clears the current response
   */
  clearCurrentResponse(): Promise<void>;

  /**
   * Synchronizes current in-memory state to the backend
   */
  syncState(): Promise<void>;
}
