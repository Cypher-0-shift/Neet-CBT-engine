import type { IAnalyzer, AnalyticsDataGraph } from './IAnalyzer';
import type { AnalyticsReport, QuestionResultRecord, AnalyticsQuestionStatus } from '../../../shared/types/analytics.types';

export class TimeAnalyzer implements IAnalyzer {
  analyze(data: AnalyticsDataGraph, report: Partial<AnalyticsReport>): void {
    const questions: QuestionResultRecord[] = [];
    
    // Sort answers by question number if possible, or just iterate questions
    // Better to iterate questions to maintain order
    const sortedQuestions = Array.from(data.questions.values()).sort((a, b) => a.questionNumber - b.questionNumber);
    const answerMap = new Map(data.answers.map(a => [a.questionId, a]));

    for (const question of sortedQuestions) {
      const answer = answerMap.get(question.id);
      
      let status: AnalyticsQuestionStatus = 'unattempted';
      let timeSpentSeconds = 0;
      let selectedOptionId: string | null = null;
      const correctOptionId = question.answer.correctOptionId;

      if (answer) {
        timeSpentSeconds = answer.timeSpentSeconds;
        selectedOptionId = answer.selectedOptionId;

        if (selectedOptionId) {
          status = selectedOptionId === correctOptionId ? 'correct' : 'wrong';
        } else if (answer.isMarkedReview) {
          status = 'marked_for_review';
        }
      }

      questions.push({
        questionId: question.id,
        questionNumber: question.questionNumber,
        subject: question.subject,
        timeSpentSeconds,
        status,
        selectedOptionId,
        correctOptionId
      });
    }

    report.questions = questions;
  }
}
