import type { Session, Answer } from '../../../shared/types/session.types';
import type { Question } from '../../../shared/types/question.types';
import type { ExamEvent } from '../../../shared/types/event.types';
import type { AnalyticsReport } from '../../../shared/types/analytics.types';
import type { IAnalyzer, AnalyticsDataGraph } from './IAnalyzer';

import { ScoreCalculator } from './ScoreCalculator';
import { SubjectAnalyzer } from './SubjectAnalyzer';
import { TimeAnalyzer } from './TimeAnalyzer';

export class AnalyticsEngine {
  private analyzers: IAnalyzer[];

  constructor() {
    this.analyzers = [
      new ScoreCalculator(),
      new SubjectAnalyzer(),
      new TimeAnalyzer(),
    ];
  }

  public generateReport(
    session: Session,
    answers: Answer[],
    events: ExamEvent[],
    questionsArray: Question[]
  ): AnalyticsReport {
    // 1. Build Data Graph
    const questions = new Map<string, Question>(questionsArray.map(q => [q.id, q]));
    
    const data: AnalyticsDataGraph = {
      session,
      answers,
      events,
      questions,
    };

    // 2. Initialize Report
    const report: Partial<AnalyticsReport> = {
      sessionId: session.id,
      testId: session.testId,
      generatedAt: new Date().toISOString(),
      subjects: [],
      questions: [],
    };

    // 3. Run Analyzers sequentially
    for (const analyzer of this.analyzers) {
      analyzer.analyze(data, report);
    }

    return report as AnalyticsReport;
  }
}
