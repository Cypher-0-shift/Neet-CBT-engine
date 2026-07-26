/**
 * Question and Option domain types
 * Covers all question fields from the Architecture spec including
 * multi-image support, question types, and hierarchical topic structure
 */

export type Subject = 'Physics' | 'Chemistry' | 'Biology';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionType =
  | 'Conceptual'
  | 'Numerical'
  | 'Diagram Based'
  | 'Graph Based'
  | 'Assertion Reason'
  | 'Match the Following'
  | 'Experimental'
  | 'Memory Based'
  | 'Formula Based';

export interface Question {
  id: string;
  testId: string;
  questionNumber: number;
  subject: Subject;
  chapter: string;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  marks: number;
  negativeMarks: number;
  expectedTimeSeconds: number;
  questionText: string;
  questionImagePath: string | null;
  additionalImages: string[];
  tags: string[];
  source: string | null;
  year: number | null;
  options: Option[];
  answer: Answer;
}

export interface Answer {
  correctOptionId: string;
  marks: number;
  negativeMarks: number;
  explanation: string | null;
  solutionImages: string[];
  conceptTested: string | null;
  commonMistakes: string | null;
}

export interface Option {
  id: string;
  questionId: string;
  optionLabel: OptionLabel;
  optionText: string;
  optionImagePath: string | null;
  displayOrder: number;
}

export type OptionLabel = 'A' | 'B' | 'C' | 'D';

/**
 * Question state in the exam palette
 * Matches the official NTA CBT color scheme
 */
export enum QuestionStatus {
  NOT_VISITED = 'NOT_VISITED',
  NOT_ANSWERED = 'NOT_ANSWERED',
  ANSWERED = 'ANSWERED',
  MARKED_FOR_REVIEW = 'MARKED_FOR_REVIEW',
  ANSWERED_AND_MARKED = 'ANSWERED_AND_MARKED',
}

/**
 * Lightweight question reference for the palette
 */
export interface QuestionPaletteItem {
  questionId: string;
  questionNumber: number;
  subject: Subject;
  status: QuestionStatus;
}

/**
 * Shape of questions.json in the import package
 */
export interface QuestionImportData {
  id: string;
  questionNumber: number;
  subject: Subject;
  chapter: string;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  marks: number;
  negativeMarks: number;
  expectedTimeSeconds: number;
  questionText: string;
  questionImage: string | null;
  additionalImages: string[];
  tags: string[];
  source: string | null;
  year: number | null;
  options: OptionImportData[];
  answer: AnswerImportData;
}

export interface AnswerImportData {
  correctOptionId: string;
  marks: number;
  negativeMarks: number;
  explanation?: string | null;
  solutionImages?: string[];
  conceptTested?: string | null;
  commonMistakes?: string | null;
}

export interface OptionImportData {
  id?: string; // New schemas use ID, older used label, we can map label to ID if needed
  label?: OptionLabel;
  text: string;
  image: string | null;
  displayOrder: number;
}
