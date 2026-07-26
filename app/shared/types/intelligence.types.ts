import type { Question } from './question.types';

export interface Bookmark {
  id: string;
  questionId: string;
  createdAt: string;
}

export interface Note {
  id: string;
  questionId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface WrongQuestion {
  question: Question;
  sessionIds: string[]; // Sessions where this was answered incorrectly
  lastAttemptedAt: string;
  wrongCount: number;
}

export interface BookmarkWithDetails {
  bookmark: Bookmark;
  question: Question;
  note: Note | null;
}

export interface RevisionTopicRecommendation {
  topicId: string;
  subject: string;
  topic: string;
  chapter: string | null;
  weaknessScore: number;
  totalAttempts: number;
  lastAttemptedAt: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface StudyInsights {
  strongestSubject: string;
  weakestSubject: string;
  averageAccuracy: number;
  totalQuestionsAttempted: number;
  recommendedFocus: RevisionTopicRecommendation[];
}
