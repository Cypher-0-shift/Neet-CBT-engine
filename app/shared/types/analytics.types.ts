/**
 * Analytics domain types
 * Computed from raw events and answers after test submission
 */

import type { Subject } from './question.types';

// ─── Overall Performance ──────────────────────────────────────────

export interface OverallPerformance {
  totalScore: number;
  maxScore: number;
  accuracy: number;             // percentage
  negativeMarks: number;
  attemptPercentage: number;
  correctPercentage: number;
  incorrectPercentage: number;
  skippedQuestions: number;
  totalAttempted: number;
  totalCorrect: number;
  totalIncorrect: number;
}

// ─── Subject Analysis ─────────────────────────────────────────────

export interface SubjectAnalysis {
  subject: Subject;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
  averageTime: number;
  negativeMarks: number;
  attemptPercentage: number;
  score: number;
  maxScore: number;
}

// ─── Per-Question Results ─────────────────────────────────────────

export type AnalyticsQuestionStatus = 'correct' | 'wrong' | 'unattempted' | 'marked_for_review';

export interface QuestionResultRecord {
  questionId: string;
  questionNumber: number;
  subject: Subject;
  timeSpentSeconds: number;
  status: AnalyticsQuestionStatus;
  selectedOptionId: string | null;
  correctOptionId: string;
}

// ─── Full Analytics Report ────────────────────────────────────────

export interface AnalyticsReport {
  sessionId: string;
  testId: string;
  generatedAt: string;
  overall: OverallPerformance;
  subjects: SubjectAnalysis[];
  questions: QuestionResultRecord[]; // Replacing TimeAnalytics
}
