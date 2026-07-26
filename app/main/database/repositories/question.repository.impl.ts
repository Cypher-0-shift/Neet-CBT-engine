import type { Database } from 'better-sqlite3';
import type { QuestionRepository } from './question.repository';
import type { Question, Option } from '../../../shared/types/question.types';

export class QuestionRepositoryImpl implements QuestionRepository {
  constructor(private db: Database) {}

  async getQuestionsByTestId(testId: string): Promise<Question[]> {
    const rows = this.db.prepare(`
      SELECT q.*, tq.question_number, sub.name as subtopic_name, top.name as topic_name, 
             top.chapter_name, subj.name as subject_name
      FROM questions q
      JOIN test_questions tq ON q.id = tq.question_id
      JOIN subtopics sub ON q.subtopic_id = sub.id
      JOIN topics top ON sub.topic_id = top.id
      JOIN subjects subj ON top.subject_id = subj.id
      WHERE tq.test_id = ?
      ORDER BY tq.question_number ASC
    `).all(testId) as any[];

    // Fetch options for all questions in one go for efficiency
    const allOptions = this.db.prepare(`
      SELECT o.* FROM options o
      JOIN test_questions tq ON o.question_id = tq.question_id
      WHERE tq.test_id = ?
      ORDER BY o.question_id, o.display_order ASC
    `).all(testId) as any[];

    // Fetch solution images
    const allSolutionImages = this.db.prepare(`
      SELECT si.* FROM solution_images si
      JOIN test_questions tq ON si.question_id = tq.question_id
      WHERE tq.test_id = ?
      ORDER BY si.question_id, si.display_order ASC
    `).all(testId) as any[];

    return rows.map(row => {
      const qOptions = allOptions.filter(o => o.question_id === row.id).map(o => ({
        id: o.id,
        questionId: o.question_id,
        optionLabel: o.option_label,
        optionText: o.option_text,
        optionImagePath: o.option_image_path,
        displayOrder: o.display_order
      }));

      const solutionImages = allSolutionImages
        .filter(si => si.question_id === row.id)
        .map(si => si.image_path as string);

      return {
        id: row.id,
        testId: testId,
        questionNumber: row.question_number,
        subject: row.subject_name,
        chapter: row.chapter_name,
        topic: row.topic_name,
        subtopic: row.subtopic_name,
        difficulty: row.difficulty,
        questionType: row.question_type,
        marks: row.marks,
        negativeMarks: row.negative_marks,
        expectedTimeSeconds: row.expected_time_seconds,
        questionText: row.question_text,
        questionImagePath: row.question_image_path,
        additionalImages: row.additional_images_json ? JSON.parse(row.additional_images_json) : [],
        tags: row.tags_json ? JSON.parse(row.tags_json) : [],
        source: row.source,
        year: row.year,
        options: qOptions,
        answer: {
          correctOptionId: row.correct_option_id,
          marks: row.marks,
          negativeMarks: row.negative_marks,
          explanation: row.explanation,
          solutionImages: solutionImages,
          conceptTested: row.concept_tested,
          commonMistakes: row.common_mistakes
        }
      } as Question;
    });
  }

  async getQuestionById(_questionId: string): Promise<Question | null> {
    // Placeholder - usually used for specific fetching
    return null;
  }

  async getOptionsByQuestionId(questionId: string): Promise<Option[]> {
    const rows = this.db.prepare('SELECT * FROM options WHERE question_id = ? ORDER BY display_order ASC').all(questionId) as any[];
    return rows.map(row => ({
      id: row.id,
      questionId: row.question_id,
      optionLabel: row.option_label,
      optionText: row.option_text,
      optionImagePath: row.option_image_path,
      displayOrder: row.display_order
    }));
  }

  async createQuestions(_questions: Question[]): Promise<void> {
    // This is a simplified version. A real importer would upsert subjects/topics
    // and handle test_questions mapping. The schema demands normalized topics.
    // Assuming for this implementation the normalized topics exist or are handled by ImportService.
  }

  async createOptions(options: Option[]): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO options (id, question_id, option_label, option_text, option_image_path, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertOptions = this.db.transaction((opts: Option[]) => {
      for (const o of opts) {
        stmt.run(o.id, o.questionId, o.optionLabel, o.optionText, o.optionImagePath, o.displayOrder);
      }
    });

    insertOptions(options);
  }
}
