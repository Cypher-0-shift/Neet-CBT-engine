/**
 * QuestionRepository interface
 * Handles CRUD for questions and options
 */

import type { Question, Option } from '../../../shared/types/question.types';

export interface QuestionRepository {
  /**
   * Get all questions for a specific test (without answers)
   * @param testId The UUID of the test
   */
  getQuestionsByTestId(testId: string): Promise<Question[]>;

  /**
   * Get a specific question by its ID
   * @param questionId The UUID of the question
   */
  getQuestionById(questionId: string): Promise<Question | null>;

  /**
   * Get options for a specific question
   * @param questionId The UUID of the question
   */
  getOptionsByQuestionId(questionId: string): Promise<Option[]>;

  /**
   * Create questions in bulk (called during import)
   * @param questions Array of questions
   */
  createQuestions(questions: Question[]): Promise<void>;

  /**
   * Create options in bulk (called during import)
   * @param options Array of options
   */
  createOptions(options: Option[]): Promise<void>;
}
