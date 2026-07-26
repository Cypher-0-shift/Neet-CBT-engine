/**
 * AnalyticsRepository interface
 * Handles CRUD operations for computed analytics and reports
 */

import type { AnalyticsReport } from '../../../shared/types/analytics.types';

export interface AnalyticsRepository {
  /**
   * Save a computed analytics report
   * @param report The analytics report object
   */
  saveReport(report: AnalyticsReport): Promise<void>;

  /**
   * Retrieve an analytics report for a specific session
   * @param sessionId The UUID of the session
   */
  getReportBySessionId(sessionId: string): Promise<AnalyticsReport | null>;

  /**
   * Get weak topics across all sessions
   * @param limit Max topics to return
   */
  getWeakTopics(limit?: number): Promise<any[]>;

  /**
   * Get mistake patterns across all sessions
   */
  getMistakePatterns(): Promise<any[]>;
}
