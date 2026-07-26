/**
 * Session domain types
 * Represents an exam attempt — from creation through submission
 */

export enum SessionStatus {
  /** Session created, candidate details entered */
  CREATED = 'CREATED',
  /** Instructions being shown */
  INSTRUCTIONS = 'INSTRUCTIONS',
  /** Exam in progress */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Exam paused (e.g. app minimized, not available in exam mode) */
  PAUSED = 'PAUSED',
  /** Timer ran out */
  TIME_UP = 'TIME_UP',
  /** Student submitted manually */
  SUBMITTED = 'SUBMITTED',
  /** Exam was abandoned / app crashed mid-session */
  ABANDONED = 'ABANDONED',
}

export enum ExamMode {
  /** Full simulation — no review during exam, strict timer */
  EXAM = 'Exam',
  /** Practice — can pause, extended time options */
  PRACTICE = 'Practice',
}

export interface Session {
  id: string;
  testId: string;
  candidateName: string;
  registrationNumber: string;
  mode: ExamMode;
  language: string;
  startTime: string;
  endTime: string | null;
  durationSeconds: number;
  timeRemainingSeconds: number;
  status: SessionStatus;
  totalScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalSkipped: number;
  totalMarkedReview: number;
  testVersionHash: string | null;
  isSubmitted: boolean;
  createdAt: string;
}

export interface Answer {
  id: string;
  sessionId: string;
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  marksAwarded: number;
  timeSpentSeconds: number;
  visitCount: number;
  isMarkedReview: boolean;
  firstAnswerTime: string | null;
  lastAnswerTime: string | null;
  answerChanges: number;
  createdAt: string;
}

/**
 * Candidate details entered before starting exam
 */
export interface CandidateDetails {
  name: string;
  registrationNumber: string;
  language: string;
  mode: ExamMode;
}

/**
 * Serializable session checkpoint for crash recovery
 */
export interface NavigationEvent {
  questionId: string;
  timestamp: string;
  durationSeconds?: number;
}

export interface SessionCheckpoint {
  sessionId: string;
  currentQuestionIndex: number;
  currentSubject: string;
  timeRemainingSeconds: number;
  answers: Record<string, string | null>; // questionId -> selectedOptionId
  markedForReview: string[];
  visitedQuestions: string[];
  navigationHistory: NavigationEvent[];
  timestamp: string;
  appVersion?: string;
  checkpointVersion?: number;
}
