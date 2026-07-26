/**
 * Scoring constants
 * Configuration-driven to support future exam profiles (JEE, GATE, etc.)
 */

export interface ScoringConfig {
  marksPerCorrect: number;
  marksPerIncorrect: number;
  marksPerUnattempted: number;
  maxMarks: number;
  totalQuestions: number;
}

export const NEET_SCORING: ScoringConfig = {
  marksPerCorrect: 4,
  marksPerIncorrect: -1,
  marksPerUnattempted: 0,
  maxMarks: 720,
  totalQuestions: 200,
};

/**
 * Calculate score for a single question
 */
export function calculateScore(
  userOptionId: string | null,
  correctOptionId: string,
  config: ScoringConfig
): number {
  if (!userOptionId) return config.marksPerUnattempted;
  if (userOptionId === correctOptionId) return config.marksPerCorrect;
  return -config.marksPerIncorrect; // Subtracted
}
