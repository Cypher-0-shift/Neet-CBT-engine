import type { Database } from 'better-sqlite3';
import type { AnalyticsRepository } from './analytics.repository';
import type { AnalyticsReport } from '../../../shared/types/analytics.types';
import { v4 as uuidv4 } from 'uuid';

export class AnalyticsRepositoryImpl implements AnalyticsRepository {
  constructor(private db: Database) {}

  async saveReport(report: AnalyticsReport): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO session_analytics (id, session_id, category, metric_key, metric_value, details_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // In a real implementation, we would flatten the report into categories.
    // For simplicity, let's store the whole report as JSON under 'FULL_REPORT' category.
    // Alternatively, we could break it down into TIME, SCORE, etc.
    this.db.prepare('DELETE FROM session_analytics WHERE session_id = ?').run(report.sessionId);
    
    stmt.run(
      uuidv4(),
      report.sessionId,
      'FULL_REPORT',
      'overall',
      report.overall.totalScore || 0,
      JSON.stringify(report)
    );
  }

  async getReportBySessionId(sessionId: string): Promise<AnalyticsReport | null> {
    const row = this.db.prepare(`
      SELECT details_json FROM session_analytics 
      WHERE session_id = ? AND category = 'FULL_REPORT'
    `).get(sessionId) as { details_json: string } | undefined;

    if (!row) return null;
    return JSON.parse(row.details_json) as AnalyticsReport;
  }

  async getWeakTopics(limit: number = 10): Promise<any[]> {
    return this.db.prepare(`
      SELECT topics.name as topicName, subjects.name as subjectName, 
             u.total_attempts, u.total_correct, u.weakness_score
      FROM user_topic_stats u
      JOIN topics ON u.topic_id = topics.id
      JOIN subjects ON topics.subject_id = subjects.id
      ORDER BY u.weakness_score DESC
      LIMIT ?
    `).all(limit) as any[];
  }

  async getMistakePatterns(): Promise<any[]> {
    // This could query the events or session_analytics table to find pattern data
    return [];
  }
}
