import type { IAnalyzer, AnalyticsDataGraph } from './IAnalyzer';
import type { AnalyticsReport, SubjectAnalysis } from '../../../shared/types/analytics.types';
import type { Subject } from '../../../shared/types/question.types';
import { NEET_SCORING as SCORING } from '../../../shared/constants/scoring.constants';

export class SubjectAnalyzer implements IAnalyzer {
  analyze(data: AnalyticsDataGraph, report: Partial<AnalyticsReport>): void {
    const subjectMap = new Map<Subject, SubjectAnalysis>();

    const answerMap = new Map(data.answers.map(a => [a.questionId, a]));

    for (const [questionId, question] of data.questions.entries()) {
      if (!subjectMap.has(question.subject)) {
        subjectMap.set(question.subject, {
          subject: question.subject,
          totalQuestions: 0,
          attempted: 0,
          correct: 0,
          incorrect: 0,
          skipped: 0,
          accuracy: 0,
          averageTime: 0,
          negativeMarks: 0,
          attemptPercentage: 0,
          score: 0,
          maxScore: 0,
        });
      }

      const stats = subjectMap.get(question.subject)!;
      stats.totalQuestions++;
      stats.maxScore += SCORING.marksPerCorrect;

      const answer = answerMap.get(questionId);

      if (answer && answer.timeSpentSeconds) {
        // Average time computation intermediate sum
        stats.averageTime += answer.timeSpentSeconds;
      }

      if (!answer || answer.selectedOptionId === null || answer.selectedOptionId === undefined) {
        stats.skipped++;
      } else {
        stats.attempted++;
        if ((answer.selectedOptionId !== null && answer.selectedOptionId === data.questions.get(answer.questionId)?.answer.correctOptionId)) {
          stats.correct++;
          stats.score += SCORING.marksPerCorrect;
        } else {
          stats.incorrect++;
          stats.score += SCORING.marksPerIncorrect;
          stats.negativeMarks += Math.abs(SCORING.marksPerIncorrect);
        }
      }
    }

    // Finalize averages
    for (const stats of subjectMap.values()) {
      stats.accuracy = stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0;
      stats.attemptPercentage = stats.totalQuestions > 0 ? (stats.attempted / stats.totalQuestions) * 100 : 0;
      stats.averageTime = stats.totalQuestions > 0 ? (stats.averageTime / stats.totalQuestions) : 0;
    }

    report.subjects = Array.from(subjectMap.values());
  }
}
