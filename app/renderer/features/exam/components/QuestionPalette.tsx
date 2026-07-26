import React, { useMemo } from 'react';
import { useTestStore } from '../../../stores/testStore';
import { useSessionStore } from '../../../stores/sessionStore';

interface PaletteButtonProps {
  questionNumber: number;
  isCurrent: boolean;
  status: 'NOT_VISITED' | 'NOT_ANSWERED' | 'ANSWERED' | 'REVIEW' | 'ANSWERED_REVIEW';
  onClick: () => void;
}

const PaletteButton = React.memo(({ questionNumber, isCurrent, status, onClick }: PaletteButtonProps) => {
  let bg = 'bg-gray-200 text-gray-700'; // Default NOT_VISITED
  let shape = 'rounded-md';
  let innerDot = null;

  switch (status) {
    case 'NOT_ANSWERED':
      bg = 'bg-red-500 text-white';
      shape = 'rounded-t-lg rounded-b-none';
      break;
    case 'ANSWERED':
      bg = 'bg-green-500 text-white';
      shape = 'rounded-t-lg rounded-b-none';
      break;
    case 'REVIEW':
      bg = 'bg-purple-600 text-white';
      shape = 'rounded-full';
      break;
    case 'ANSWERED_REVIEW':
      bg = 'bg-purple-600 text-white';
      shape = 'rounded-full relative';
      innerDot = <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />;
      break;
  }

  const currentRing = isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : '';

  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center font-bold text-sm shadow-sm transition-transform hover:scale-105 active:scale-95 ${bg} ${shape} ${currentRing}`}
    >
      {questionNumber}
      {innerDot}
    </button>
  );
});
PaletteButton.displayName = 'PaletteButton';

export function QuestionPalette() {
  const { activeTestQuestions } = useTestStore();
  const { currentSubject, currentQuestionIndex, setCurrentQuestion, answers, reviewFlags, visitedQuestions } = useSessionStore();

  const currentSubjectQuestions = useMemo(() => {
    return activeTestQuestions.filter(q => q.subject === currentSubject);
  }, [activeTestQuestions, currentSubject]);

  // Aggregate counts
  const counts = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let review = 0;
    let answeredReview = 0;
    let notVisited = 0;

    currentSubjectQuestions.forEach(q => {
      const hasAnswer = !!answers[q.id]?.selectedOptionId;
      const hasReview = reviewFlags.has(q.id);
      const isVisited = visitedQuestions.has(q.id);

      if (hasAnswer && hasReview) answeredReview++;
      else if (hasReview) review++;
      else if (hasAnswer) answered++;
      else if (isVisited) notAnswered++;
      else notVisited++;
    });

    return { answered, notAnswered, review, answeredReview, notVisited };
  }, [currentSubjectQuestions, answers, reviewFlags, visitedQuestions]);

  return (
    <div className="w-full lg:w-72 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-300 flex flex-col h-64 lg:h-full shrink-0">
      {/* Legend */}
      <div className="p-4 border-b border-gray-300 bg-white grid grid-cols-2 gap-2 text-xs font-semibold text-gray-700">
        <div className="flex items-center"><span className="w-6 h-6 rounded-t-lg bg-green-500 text-white flex items-center justify-center mr-2">{counts.answered}</span> Answered</div>
        <div className="flex items-center"><span className="w-6 h-6 rounded-t-lg bg-red-500 text-white flex items-center justify-center mr-2">{counts.notAnswered}</span> Not Answered</div>
        <div className="flex items-center"><span className="w-6 h-6 rounded-md bg-gray-200 text-gray-600 flex items-center justify-center mr-2">{counts.notVisited}</span> Not Visited</div>
        <div className="flex items-center"><span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center mr-2">{counts.review}</span> Marked for Review</div>
        <div className="flex items-center col-span-2 mt-1">
          <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center mr-2 relative">
            {counts.answeredReview}
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
          </span> 
          Answered & Marked for Review (will be considered for evaluation)
        </div>
      </div>

      <div className="p-4 bg-blue-100/50 border-b border-gray-300 font-bold text-blue-900">
        {currentSubject}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-wrap gap-3">
          {currentSubjectQuestions.map((q, index) => {
            const hasAnswer = !!answers[q.id]?.selectedOptionId;
            const hasReview = reviewFlags.has(q.id);
            const isVisited = visitedQuestions.has(q.id);
            const isCurrent = index === currentQuestionIndex;

            let status: any = 'NOT_VISITED';
            if (hasAnswer && hasReview) status = 'ANSWERED_REVIEW';
            else if (hasReview) status = 'REVIEW';
            else if (hasAnswer) status = 'ANSWERED';
            else if (isVisited) status = 'NOT_ANSWERED';

            return (
              <PaletteButton
                key={q.id}
                questionNumber={q.questionNumber}
                isCurrent={isCurrent}
                status={status}
                onClick={() => setCurrentQuestion(index)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
