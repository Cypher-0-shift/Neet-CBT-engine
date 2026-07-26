import type Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type { Note, WrongQuestion, BookmarkWithDetails, StudyInsights, RevisionTopicRecommendation } from '../../../shared/types/intelligence.types';


export class IntelligenceRepositoryImpl {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // ─── Bookmarks ───────────────────────────────────────────────────

  public toggleBookmark(questionId: string): boolean {
    const existing = this.db.prepare('SELECT id FROM bookmarks WHERE question_id = ?').get(questionId);
    
    if (existing) {
      this.db.prepare('DELETE FROM bookmarks WHERE question_id = ?').run(questionId);
      return false;
    } else {
      this.db.prepare('INSERT INTO bookmarks (id, question_id) VALUES (?, ?)').run(uuidv4(), questionId);
      return true;
    }
  }

  public getBookmarks(): BookmarkWithDetails[] {
    // Join bookmarks, questions, and notes
    const rows = this.db.prepare(`
      SELECT 
        b.id as bookmarkId, b.question_id as questionId, b.created_at as bookmarkCreatedAt,
        q.*,
        n.id as noteId, n.content as noteContent, n.created_at as noteCreatedAt, n.updated_at as noteUpdatedAt
      FROM bookmarks b
      JOIN questions q ON b.question_id = q.id
      LEFT JOIN notes n ON b.question_id = n.question_id
      ORDER BY b.created_at DESC
    `).all() as any[];

    return rows.map(row => ({
      bookmark: {
        id: row.bookmarkId,
        questionId: row.questionId,
        createdAt: row.bookmarkCreatedAt,
      },
      question: this.mapRowToQuestion(row),
      note: row.noteId ? {
        id: row.noteId,
        questionId: row.questionId,
        content: row.noteContent,
        createdAt: row.noteCreatedAt,
        updatedAt: row.noteUpdatedAt,
      } : null,
    }));
  }

  // ─── Notes ───────────────────────────────────────────────────────

  public saveNote(questionId: string, content: string): Note {
    const existing = this.db.prepare('SELECT id FROM notes WHERE question_id = ?').get(questionId) as any;
    
    if (existing) {
      this.db.prepare('UPDATE notes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE question_id = ?').run(content, questionId);
      return this.getNote(questionId)!;
    } else {
      const id = uuidv4();
      this.db.prepare('INSERT INTO notes (id, question_id, content) VALUES (?, ?, ?)').run(id, questionId, content);
      return this.getNote(questionId)!;
    }
  }

  public getNote(questionId: string): Note | null {
    const row = this.db.prepare('SELECT * FROM notes WHERE question_id = ?').get(questionId) as any;
    if (!row) return null;
    return {
      id: row.id,
      questionId: row.question_id,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // ─── Wrong Questions Notebook ────────────────────────────────────

  public getWrongQuestions(limit: number = 50, offset: number = 0, subjectFilter?: string): { questions: WrongQuestion[], total: number } {
    let baseQuery = `
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      JOIN sessions s ON a.session_id = s.id
      JOIN subtopics st ON q.subtopic_id = st.id
      JOIN topics t ON st.topic_id = t.id
      JOIN subjects sub ON t.subject_id = sub.id
      WHERE a.is_correct = 0
    `;
    
    const params: any[] = [];

    if (subjectFilter) {
      baseQuery += ` AND sub.name = ?`;
      params.push(subjectFilter);
    }

    const totalRow = this.db.prepare(`SELECT COUNT(DISTINCT a.question_id) as total ${baseQuery}`).get(...params) as any;
    const total = totalRow.total;

    // Group by question to get wrong count and session IDs
    const rows = this.db.prepare(`
      SELECT 
        q.*,
        GROUP_CONCAT(s.id) as sessionIds,
        COUNT(a.id) as wrongCount,
        MAX(s.created_at) as lastAttemptedAt,
        sub.name as subjectName
      ${baseQuery}
      GROUP BY q.id
      ORDER BY lastAttemptedAt DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as any[];

    const questions: WrongQuestion[] = rows.map(row => ({
      question: this.mapRowToQuestion(row),
      sessionIds: row.sessionIds.split(','),
      lastAttemptedAt: row.lastAttemptedAt,
      wrongCount: row.wrongCount,
    }));

    return { questions, total };
  }

  // ─── Study Insights & Recommendations ─────────────────────────────

  public getStudyInsights(): StudyInsights {
    // We rely on user_topic_stats
    const stats = this.db.prepare(`
      SELECT 
        sub.name as subject,
        SUM(uts.total_attempts) as attempts,
        SUM(uts.total_correct) as correct
      FROM user_topic_stats uts
      JOIN topics t ON uts.topic_id = t.id
      JOIN subjects sub ON t.subject_id = sub.id
      GROUP BY sub.id
    `).all() as any[];

    if (stats.length === 0) {
      return {
        strongestSubject: 'N/A',
        weakestSubject: 'N/A',
        averageAccuracy: 0,
        totalQuestionsAttempted: 0,
        recommendedFocus: [],
      };
    }

    let totalAttempts = 0;
    let totalCorrect = 0;
    let strongest = stats[0];
    let weakest = stats[0];

    stats.forEach(s => {
      totalAttempts += s.attempts;
      totalCorrect += s.correct;
      
      const acc = s.attempts > 0 ? s.correct / s.attempts : 0;
      const sAcc = strongest.attempts > 0 ? strongest.correct / strongest.attempts : 0;
      const wAcc = weakest.attempts > 0 ? weakest.correct / weakest.attempts : 0;

      if (acc > sAcc) strongest = s;
      if (acc < wAcc) weakest = s;
    });

    // Get Recommendations based on weakness score
    const recs = this.db.prepare(`
      SELECT 
        uts.topic_id as topicId,
        sub.name as subject,
        t.name as topic,
        t.chapter_name as chapter,
        uts.weakness_score as weaknessScore,
        uts.total_attempts as totalAttempts,
        uts.last_updated as lastAttemptedAt
      FROM user_topic_stats uts
      JOIN topics t ON uts.topic_id = t.id
      JOIN subjects sub ON t.subject_id = sub.id
      WHERE uts.total_attempts > 0
      ORDER BY uts.weakness_score DESC
      LIMIT 5
    `).all() as any[];

    const recommendedFocus: RevisionTopicRecommendation[] = recs.map((r, i) => ({
      topicId: r.topicId,
      subject: r.subject,
      topic: r.topic,
      chapter: r.chapter,
      weaknessScore: r.weaknessScore,
      totalAttempts: r.totalAttempts,
      lastAttemptedAt: r.lastAttemptedAt,
      priority: i < 2 ? 'High' : (i < 4 ? 'Medium' : 'Low'),
      reason: `Accuracy is low and weakness score is high (${Math.round(r.weaknessScore)}/100)`,
    }));

    return {
      strongestSubject: strongest.subject,
      weakestSubject: weakest.subject,
      averageAccuracy: totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0,
      totalQuestionsAttempted: totalAttempts,
      recommendedFocus,
    };
  }

  private mapRowToQuestion(row: any): Question {
    return {
      id: row.id || row.question_id,
      subtopic: row.subtopic_name || '', // Since we join topics, we might need to select it, or just leave blank if not used
      chapter: row.chapter_name || '',
      topic: row.topic_name || '',
      subject: row.subject_name || 'Physics',
      testId: row.test_id || '',
      questionNumber: row.question_number || 0,
      difficulty: row.difficulty,
      questionType: row.question_type,
      marks: row.marks,
      negativeMarks: row.negative_marks,
      expectedTimeSeconds: row.expected_time_seconds,
      questionText: row.question_text,
      questionImagePath: row.question_image_path,
      additionalImages: row.additional_images_json ? JSON.parse(row.additional_images_json) : [],
      solutionText: row.solution_text,
      solutionImagePath: row.solution_image_path,
      tags: row.tags_json ? JSON.parse(row.tags_json) : [],
      source: row.source,
      year: row.year,
      options: [], // Options are fetched separately if needed, for notebook we might want them.
    };
  }
}
