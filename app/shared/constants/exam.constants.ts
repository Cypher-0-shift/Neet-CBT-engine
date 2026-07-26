/**
 * Exam constants
 */

export const NEET_EXAM = {
  /** Total exam duration in minutes */
  DURATION_MINUTES: 200,

  /** Total number of questions */
  TOTAL_QUESTIONS: 200,

  /** Questions per subject (Section A: 35 + Section B: 15 = 50 per subject, but only 45 graded) */
  QUESTIONS_PER_SUBJECT: 50,

  /** Subjects in display order */
  SUBJECTS: ['Physics', 'Chemistry', 'Biology'] as const,

  /** Default marks per correct answer */
  MARKS_CORRECT: 4,

  /** Default negative marks per incorrect answer */
  MARKS_INCORRECT: -1,

  /** Marks for unattempted */
  MARKS_UNATTEMPTED: 0,

  /** Maximum possible score */
  MAX_MARKS: 720,

  /** Auto-save interval in milliseconds */
  AUTO_SAVE_INTERVAL_MS: 30_000,

  /** Event batch flush interval in milliseconds */
  EVENT_FLUSH_INTERVAL_MS: 5_000,

  /** Maximum events to batch before forced flush */
  EVENT_BATCH_MAX_SIZE: 50,

  /** Idle detection threshold in seconds */
  IDLE_THRESHOLD_SECONDS: 60,
} as const;
