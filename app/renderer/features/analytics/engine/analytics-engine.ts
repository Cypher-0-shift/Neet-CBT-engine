/**
 * AnalyticsEngine interface
 * Computes all analytics from raw events and answers
 */

import type { Session, Answer } from '@shared/types/session.types';
import type { ExamEvent } from '@shared/types/event.types';
import type { AnalyticsReport } from '@shared/types/analytics.types';

export interface AnalyticsEngine {
  /**
   * Computes a full analytics report for a session
   * @param session The completed session
   * @param answers The final answers array
   * @param events The raw events timeline
   */
  computeFullReport(
    session: Session,
    answers: Answer[],
    events: ExamEvent[]
  ): AnalyticsReport;

  /**
   * Helper: Computes time analytics
   */
  computeTimeAnalytics(events: ExamEvent[], answers: Answer[]): any;

  /**
   * Helper: Computes subject-wise and topic-wise analytics
   */
  computeSubjectAnalytics(answers: Answer[]): any;

  /**
   * Helper: Detects behavioural patterns (e.g. panic, guessing)
   */
  computeBehaviouralAnalytics(events: ExamEvent[]): any;
}
