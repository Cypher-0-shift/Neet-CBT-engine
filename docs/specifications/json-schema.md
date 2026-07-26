# NEET CBT Engine - Zod Schema Definitions

The application strictly validates all incoming JSON data using Zod. This document outlines the exact schemas used by the Import Engine.

## `import.schema.ts`

```typescript
import { z } from 'zod';

export const importMetadataSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  description: z.string().optional(),
  durationMinutes: z.number().min(1),
  maxMarks: z.number().min(1),
  negativeMarkingRatio: z.number().min(0),
  subjectDistribution: z.record(z.number()),
  source: z.string().optional(),
  year: z.number().optional(),
  version: z.string().default('1.0'),
  author: z.string().optional(),
  instructions: z.string().optional(),
  language: z.enum(['EN', 'HI', 'BILINGUAL']).default('EN'),
  examType: z.string().default('NEET'),
  scoringRules: z.object({
    correct: z.number(),
    incorrect: z.number(),
    unattempted: z.number()
  }).default({ correct: 4, incorrect: -1, unattempted: 0 })
});

export const importOptionSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  text: z.string(),
  image: z.string().optional(),
  displayOrder: z.number().optional()
});

export const importAnswerSchema = z.object({
  correctOptionId: z.string(),
  marks: z.number(),
  negativeMarks: z.number(),
  explanation: z.string().optional(),
  solutionImages: z.array(z.string()).optional(),
  conceptTested: z.string().optional(),
  commonMistakes: z.string().optional()
});

export const importQuestionSchema = z.object({
  id: z.string(),
  questionNumber: z.number(),
  subject: z.string(),
  chapter: z.string(),
  topic: z.string(),
  subtopic: z.string(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  questionType: z.string(),
  expectedTimeSeconds: z.number().optional(),
  questionText: z.string(),
  questionImage: z.string().optional(),
  additionalImages: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  options: z.array(importOptionSchema).min(2),
  answer: importAnswerSchema
});

export const importPackageSchema = z.array(importQuestionSchema);
```
