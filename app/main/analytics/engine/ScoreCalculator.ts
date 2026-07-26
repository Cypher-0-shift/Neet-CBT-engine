import type { IAnalyzer, AnalyticsDataGraph } from './IAnalyzer';
import type { AnalyticsReport, OverallPerformance } from '../../../shared/types/analytics.types';
import { NEET_SCORING as SCORING } from '../../../shared/constants/scoring.constants';

export class ScoreCalculator implements IAnalyzer {
  analyze(data: AnalyticsDataGraph, report: Partial<AnalyticsReport>): void {
    let totalScore = 0;
    let maxScore = 0;
    let negativeMarks = 0;
    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let skippedQuestions = 0;

    const totalQuestions = data.questions.size;

    // Build answer map
    const answerMap = new Map(data.answers.map(a => [a.questionId, a]));

    for (const [questionId, _question] of data.questions.entries()) {
      // In NEET, max score is typically 4 per question
      maxScore += SCORING.marksPerCorrect;

      const answer = answerMap.get(questionId);

      if (!answer || answer.selectedOptionId === null || answer.selectedOptionId === undefined) {
        skippedQuestions++;
      } else {
        totalAttempted++;
        if ((answer.selectedOptionId !== null && answer.selectedOptionId === data.questions.get(answer.questionId)?.answer.correctOptionId)) {
          totalCorrect++;
          totalScore += SCORING.marksPerCorrect;
        } else {
          totalIncorrect++;
          totalScore += SCORING.marksPerIncorrect; // Usually -1
          negativeMarks += Math.abs(SCORING.marksPerIncorrect);
        }
      }
    }

    const accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;
    const attemptPercentage = totalQuestions > 0 ? (totalAttempted / totalQuestions) * 100 : 0;
    const correctPercentage = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    const incorrectPercentage = totalQuestions > 0 ? (totalIncorrect / totalQuestions) * 100 : 0;

    const overall: OverallPerformance = {
      totalScore,
      maxScore,
      accuracy,
      negativeMarks,
      attemptPercentage,
      correctPercentage,
      incorrectPercentage,
      skippedQuestions,
      totalAttempted,
      totalCorrect,
      totalIncorrect,
    };

    report.overall = overall;
  }
}
