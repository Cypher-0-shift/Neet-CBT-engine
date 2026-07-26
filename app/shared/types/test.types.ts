/**
 * Test domain types
 * Represents an imported test package and its metadata
 */

export interface Test {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  maxMarks: number;
  negativeMarkingRatio: number;
  totalQuestions: number;
  subjectDistribution: SubjectDistribution;
  source: string | null;
  year: number | null;
  importDate: string;
  packageHash: string;
  metadata: TestMetadata;
  createdAt: string;
}

export interface SubjectDistribution {
  physics: number;
  chemistry: number;
  biology: number;
}

export interface TestMetadata {
  version: string;
  author: string | null;
  instructions: string | null;
  language: string;
  examType: string;
  scoringRules: ScoringRules;
  [key: string]: unknown;
}

export interface ScoringRules {
  marksPerCorrect: number;
  marksPerIncorrect: number;
  marksPerUnattempted: number;
}

export interface TestSummary {
  id: string;
  name: string;
  totalQuestions: number;
  durationMinutes: number;
  maxMarks: number;
  subjectDistribution: SubjectDistribution;
  importDate: string;
  totalImages: number;
  sessionsCount: number;
  lastAttemptDate: string | null;
}

export interface TestImportResult {
  success: boolean;
  testId: string | null;
  testSummary: TestSummary | null;
  errors: string[];
  warnings: string[];
}

export type ImportStep =
  | 'extracting'
  | 'reading_metadata'
  | 'reading_questions'
  | 'reading_answers'
  | 'loading_images'
  | 'validating'
  | 'saving'
  | 'ready';

export interface ImportProgress {
  step: ImportStep;
  label: string;
  progress: number; // 0-100
  detail: string | null;
}
