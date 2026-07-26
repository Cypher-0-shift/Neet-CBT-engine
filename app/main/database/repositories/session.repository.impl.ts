import type { Database } from 'better-sqlite3';
import type { SessionRepository } from './session.repository';
import type { Session, Answer, SessionCheckpoint } from '../../../shared/types/session.types';

export class SessionRepositoryImpl implements SessionRepository {
  constructor(private db: Database) {}

  async createSession(session: Session): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO sessions (
        id, test_id, candidate_name, registration_number, mode, language,
        start_time, duration_seconds, time_remaining_seconds, status, test_version_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      session.id,
      session.testId,
      session.candidateName,
      session.registrationNumber,
      session.mode,
      session.language,
      session.startTime,
      session.durationSeconds,
      session.timeRemainingSeconds,
      session.status,
      session.testVersionHash
    );
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    const row = this.db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;
    if (!row) return null;

    return {
      id: row.id,
      testId: row.test_id,
      candidateName: row.candidate_name,
      registrationNumber: row.registration_number,
      mode: row.mode,
      language: row.language,
      startTime: row.start_time,
      endTime: row.end_time,
      durationSeconds: row.duration_seconds,
      timeRemainingSeconds: row.time_remaining_seconds,
      status: row.status,
      totalScore: row.total_score,
      totalCorrect: row.total_correct,
      totalIncorrect: row.total_incorrect,
      totalSkipped: row.total_skipped,
      totalMarkedReview: row.total_marked_review,
      testVersionHash: row.test_version_hash,
      isSubmitted: row.status === 'SUBMITTED',
      createdAt: row.created_at
    };
  }

  async getIncompleteSessions(): Promise<Session[]> {
    const rows = this.db.prepare("SELECT * FROM sessions WHERE status IN ('IN_PROGRESS', 'PAUSED')").all() as any[];
    return rows.map(row => ({
      id: row.id,
      testId: row.test_id,
      candidateName: row.candidate_name,
      registrationNumber: row.registration_number,
      mode: row.mode,
      language: row.language,
      startTime: row.start_time,
      endTime: row.end_time,
      durationSeconds: row.duration_seconds,
      timeRemainingSeconds: row.time_remaining_seconds,
      status: row.status,
      totalScore: row.total_score,
      totalCorrect: row.total_correct,
      totalIncorrect: row.total_incorrect,
      totalSkipped: row.total_skipped,
      totalMarkedReview: row.total_marked_review,
      testVersionHash: row.test_version_hash,
      isSubmitted: row.status === 'SUBMITTED',
      createdAt: row.created_at
    }));
  }

  async getSessionHistory(_limit?: number, _offset?: number): Promise<Session[]> {
    const rows = this.db.prepare("SELECT * FROM sessions WHERE status = 'SUBMITTED' ORDER BY start_time DESC").all() as any[];
    return rows.map(row => ({
      id: row.id,
      testId: row.test_id,
      candidateName: row.candidate_name,
      registrationNumber: row.registration_number,
      mode: row.mode,
      language: row.language,
      startTime: row.start_time,
      endTime: row.end_time,
      durationSeconds: row.duration_seconds,
      timeRemainingSeconds: row.time_remaining_seconds,
      status: row.status,
      totalScore: row.total_score,
      totalCorrect: row.total_correct,
      totalIncorrect: row.total_incorrect,
      totalSkipped: row.total_skipped,
      totalMarkedReview: row.total_marked_review,
      testVersionHash: row.test_version_hash,
      isSubmitted: row.status === 'SUBMITTED',
      createdAt: row.created_at
    }));
  }

  async abandonIncompleteSessions(): Promise<void> {
    this.db.prepare("UPDATE sessions SET status = 'ABANDONED' WHERE status IN ('IN_PROGRESS', 'PAUSED')").run();
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<boolean> {
    if (Object.keys(updates).length === 0) return true;
    const sets = [];
    const values = [];
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'id') continue;
      // Convert camelCase to snake_case simple approximation for the fields we need
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      sets.push(`${snakeKey} = ?`);
      values.push(value);
    }
    values.push(sessionId);
    
    const stmt = this.db.prepare(`UPDATE sessions SET ${sets.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  async saveAnswer(answer: Answer): Promise<void> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO answers (
          id, session_id, question_id, selected_option_id, is_correct, 
          marks_awarded, time_spent_seconds, visit_count, is_marked_review,
          first_answer_time, last_answer_time, answer_change_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(session_id, question_id) DO UPDATE SET
          selected_option_id = excluded.selected_option_id,
          is_correct = excluded.is_correct,
          marks_awarded = excluded.marks_awarded,
          time_spent_seconds = excluded.time_spent_seconds,
          visit_count = excluded.visit_count,
          is_marked_review = excluded.is_marked_review,
          last_answer_time = excluded.last_answer_time,
          answer_change_count = excluded.answer_change_count,
          updated_at = CURRENT_TIMESTAMP
      `);

      stmt.run(
        answer.id,
        answer.sessionId,
        answer.questionId,
        answer.selectedOptionId || null,
        answer.isCorrect === null ? null : (answer.isCorrect ? 1 : 0),
        answer.marksAwarded,
        answer.timeSpentSeconds,
        answer.visitCount,
        answer.isMarkedReview ? 1 : 0,
        answer.firstAnswerTime,
        answer.lastAnswerTime,
        answer.answerChanges
      );
    } catch (error) {
      console.error('Failed to save answer in DB:', error);
      throw new Error(`DB Error: Failed to save answer. The database might be locked or full.`);
    }
  }

  async getAnswersBySessionId(sessionId: string): Promise<Answer[]> {
    const rows = this.db.prepare('SELECT * FROM answers WHERE session_id = ?').all(sessionId) as any[];
    return rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      questionId: row.question_id,
      selectedOptionId: row.selected_option_id,
      isCorrect: row.is_correct === null ? null : Boolean(row.is_correct),
      marksAwarded: row.marks_awarded,
      timeSpentSeconds: row.time_spent_seconds,
      visitCount: row.visit_count,
      isMarkedReview: Boolean(row.is_marked_review),
      firstAnswerTime: row.first_answer_time,
      lastAnswerTime: row.last_answer_time,
      answerChanges: row.answer_change_count,
      createdAt: row.created_at
    }));
  }

  async submitSession(sessionId: string): Promise<void> {
    const transaction = this.db.transaction(() => {
      this.db.prepare(`
        UPDATE sessions SET status = 'SUBMITTED', end_time = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(sessionId);

      this.db.prepare(`
        DELETE FROM session_checkpoints WHERE session_id = ?
      `).run(sessionId);
    });

    transaction();
  }

  async saveCheckpoint(checkpoint: SessionCheckpoint): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO session_checkpoints (
        session_id, current_question_index, current_subject, time_remaining_seconds,
        answers_json, marked_for_review_json, visited_questions_json, navigation_history_json,
        app_version, checkpoint_version, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        current_question_index = excluded.current_question_index,
        current_subject = excluded.current_subject,
        time_remaining_seconds = excluded.time_remaining_seconds,
        answers_json = excluded.answers_json,
        marked_for_review_json = excluded.marked_for_review_json,
        visited_questions_json = excluded.visited_questions_json,
        navigation_history_json = excluded.navigation_history_json,
        app_version = excluded.app_version,
        checkpoint_version = excluded.checkpoint_version,
        timestamp = excluded.timestamp
    `);

    stmt.run(
      checkpoint.sessionId,
      checkpoint.currentQuestionIndex,
      checkpoint.currentSubject,
      checkpoint.timeRemainingSeconds,
      JSON.stringify(checkpoint.answers),
      JSON.stringify(checkpoint.markedForReview),
      JSON.stringify(checkpoint.visitedQuestions),
      JSON.stringify(checkpoint.navigationHistory),
      checkpoint.appVersion || null,
      checkpoint.checkpointVersion || 1,
      checkpoint.timestamp
    );
  }

  async getCheckpoint(sessionId: string): Promise<SessionCheckpoint | null> {
    const row = this.db.prepare('SELECT * FROM session_checkpoints WHERE session_id = ?').get(sessionId) as any;
    if (!row) return null;

    return {
      sessionId: row.session_id,
      currentQuestionIndex: row.current_question_index,
      currentSubject: row.current_subject,
      timeRemainingSeconds: row.time_remaining_seconds,
      answers: JSON.parse(row.answers_json),
      markedForReview: JSON.parse(row.marked_for_review_json),
      visitedQuestions: JSON.parse(row.visited_questions_json),
      navigationHistory: JSON.parse(row.navigation_history_json),
      appVersion: row.app_version,
      checkpointVersion: row.checkpoint_version,
      timestamp: row.timestamp
    };
  }
}
