import { z } from 'zod';
import { Subject, Difficulty, QuestionType, OptionLabel } from '../../../shared/types/question.types';

export const metadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  durationMinutes: z.number().int().positive(),
  maxMarks: z.number().int().positive(),
  negativeMarkingRatio: z.number().nonnegative(),
  source: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  version: z.string(),
  author: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  language: z.string(),
  examType: z.string(),
  scoringRules: z.object({
    marksPerCorrect: z.number(),
    marksPerIncorrect: z.number(),
    marksPerUnattempted: z.number()
  })
});

export const optionSchema = z.object({
  id: z.string().optional(),
  label: z.enum(['A', 'B', 'C', 'D']).optional(),
  text: z.string(),
  image: z.string().nullable().optional(),
  displayOrder: z.number().int().positive()
}).refine(data => data.id || data.label, {
  message: "Either id or label must be provided for an option"
});

export const answerSchema = z.object({
  correctOptionId: z.string(),
  marks: z.number(),
  negativeMarks: z.number(),
  explanation: z.string().nullable().optional(),
  solutionImages: z.array(z.string()).optional(),
  conceptTested: z.string().nullable().optional(),
  commonMistakes: z.string().nullable().optional()
});

export const questionSchema = z.object({
  id: z.string(),
  questionNumber: z.number().int().positive(),
  subject: z.enum(['Physics', 'Chemistry', 'Biology']),
  chapter: z.string(),
  topic: z.string(),
  subtopic: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  questionType: z.enum(['Conceptual', 'Numerical', 'Diagram Based', 'Graph Based', 'Assertion Reason', 'Match the Following', 'Experimental', 'Memory Based', 'Formula Based']),
  expectedTimeSeconds: z.number().int().positive(),
  questionText: z.string(),
  questionImage: z.string().nullable().optional(),
  additionalImages: z.array(z.string()),
  tags: z.array(z.string()),
  source: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  options: z.array(optionSchema).min(2),
  answer: answerSchema
});

export const questionsSchema = z.array(questionSchema);
