import type { Database } from 'better-sqlite3';
import type { TestRepository } from './test.repository';
import type { Test, TestSummary } from '../../../shared/types/test.types';

export class TestRepositoryImpl implements TestRepository {
  constructor(private db: Database) {}

  async getAllTests(): Promise<TestSummary[]> {
    const rows = this.db.prepare(`
      SELECT 
        t.id, t.name, t.duration_minutes, t.max_marks, t.total_questions, 
        t.subject_distribution_json, t.import_date,
        (SELECT COUNT(id) FROM sessions WHERE test_id = t.id) as sessionsCount,
        (SELECT MAX(start_time) FROM sessions WHERE test_id = t.id) as lastAttemptDate
      FROM tests t
      ORDER BY t.created_at DESC
    `).all() as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      totalQuestions: row.total_questions,
      durationMinutes: row.duration_minutes,
      maxMarks: row.max_marks,
      subjectDistribution: JSON.parse(row.subject_distribution_json),
      importDate: row.import_date,
      totalImages: 0, // In reality, we'd query questions for image paths if needed
      sessionsCount: row.sessionsCount,
      lastAttemptDate: row.lastAttemptDate
    }));
  }

  async getTestById(testId: string): Promise<Test | null> {
    const row = this.db.prepare('SELECT * FROM tests WHERE id = ?').get(testId) as any;
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      durationMinutes: row.duration_minutes,
      maxMarks: row.max_marks,
      negativeMarkingRatio: row.negative_marking_ratio,
      totalQuestions: row.total_questions,
      subjectDistribution: JSON.parse(row.subject_distribution_json),
      source: row.source,
      year: row.year,
      importDate: row.import_date,
      packageHash: row.package_hash,
      metadata: JSON.parse(row.metadata_json),
      createdAt: row.created_at
    };
  }

  async createTest(test: Test): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO tests (
        id, name, description, duration_minutes, max_marks, negative_marking_ratio,
        total_questions, subject_distribution_json, source, year, package_hash, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      test.id,
      test.name,
      test.description,
      test.durationMinutes,
      test.maxMarks,
      test.negativeMarkingRatio,
      test.totalQuestions,
      JSON.stringify(test.subjectDistribution),
      test.source,
      test.year,
      test.packageHash,
      JSON.stringify(test.metadata)
    );
  }

  async deleteTest(testId: string): Promise<boolean> {
    const result = this.db.prepare('DELETE FROM tests WHERE id = ?').run(testId);
    return result.changes > 0;
  }

  async updateTestMetadata(testId: string, metadata: Partial<Test>): Promise<boolean> {
    // Basic implementation, in a real scenario you'd construct the SET clause dynamically
    if (metadata.name) {
      this.db.prepare('UPDATE tests SET name = ? WHERE id = ?').run(metadata.name, testId);
      return true;
    }
    return false;
  }
}
