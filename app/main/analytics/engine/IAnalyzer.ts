import type { Session, Answer } from '../../../shared/types/session.types';
import type { Question } from '../../../shared/types/question.types';
import type { AnalyticsReport } from '../../../shared/types/analytics.types';
import type { ExamEvent } from '../../../shared/types/event.types';

export interface AnalyticsDataGraph {
  session: Session;
  answers: Answer[];
  events: ExamEvent[];
  questions: Map<string, Question>;
}

export interface IAnalyzer {
  analyze(data: AnalyticsDataGraph, report: Partial<AnalyticsReport>): void;
}
