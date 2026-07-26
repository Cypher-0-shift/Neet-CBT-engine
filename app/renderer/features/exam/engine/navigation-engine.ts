/**
 * NavigationEngine interface
 * Handles question traversal, subject filtering, and palette state
 */

import type { Question, QuestionPaletteItem } from '@shared/types/question.types';

export interface NavigationEngine {
  /**
   * Initializes navigation with the full question set
   */
  initialize(questions: Question[]): void;

  /**
   * Gets the active question
   */
  getCurrentQuestion(): Question | null;

  /**
   * Navigates to a specific question
   * @param questionId Target question UUID
   */
  goToQuestion(questionId: string): void;

  /**
   * Navigates to the next question in the current subject
   */
  nextQuestion(): void;

  /**
   * Navigates to the previous question in the current subject
   */
  previousQuestion(): void;

  /**
   * Switches the active subject view
   * @param subject Subject name
   */
  setSubject(subject: string): void;

  /**
   * Gets the palette state for the sidebar
   */
  getPalette(): QuestionPaletteItem[];
}
