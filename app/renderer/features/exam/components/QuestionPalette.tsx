import React, { useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { Grid } from 'react-window';
import type { CellComponentProps } from 'react-window';
import { useTestStore } from '../../../stores/testStore';
import { useSessionStore } from '../../../stores/sessionStore';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Outer size of each palette button including the gap between buttons */
const BUTTON_SIZE = 40; // px  (w-10 h-10)
const GAP = 12;         // px  (gap-3 = 0.75rem = 12px)
/** Effective stride per cell: button + gap */
const CELL_STRIDE = BUTTON_SIZE + GAP;

// ---------------------------------------------------------------------------
// PaletteButton — memoized leaf, identical to before
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Cell props passed through react-window v2's cellProps mechanism
// ---------------------------------------------------------------------------

interface PaletteCellData {
  questions: Array<{
    id: string;
    questionNumber: number;
    subject: string;
  }>;
  answers: Record<string, { selectedOptionId: string | null }>;
  reviewFlags: Set<string>;
  visitedQuestions: Set<string>;
  currentQuestionIndex: number;
  columnCount: number;
  setCurrentQuestion: (index: number) => void;
}

/**
 * Cell renderer for react-window v2 Grid.
 * Receives { rowIndex, columnIndex, style, ariaAttributes, ...cellProps }.
 * Must NOT be wrapped in React.memo — NamedExoticComponent breaks the strict
 * ReactElement | null return type that react-window v2's cellComponent requires.
 */
function PaletteCell({
  rowIndex,
  columnIndex,
  style,
  questions,
  answers,
  reviewFlags,
  visitedQuestions,
  currentQuestionIndex,
  columnCount,
  setCurrentQuestion,
}: CellComponentProps<PaletteCellData>) {
  const index = rowIndex * columnCount + columnIndex;

  // Cell is out of bounds (last row may have empty trailing cells)
  if (index >= questions.length) {
    return <div style={style} />;
  }

  const q = questions[index];
  const hasAnswer = !!answers[q.id]?.selectedOptionId;
  const hasReview = reviewFlags.has(q.id);
  const isVisited = visitedQuestions.has(q.id);
  const isCurrent = index === currentQuestionIndex;

  let status: PaletteButtonProps['status'] = 'NOT_VISITED';
  if (hasAnswer && hasReview) status = 'ANSWERED_REVIEW';
  else if (hasReview) status = 'REVIEW';
  else if (hasAnswer) status = 'ANSWERED';
  else if (isVisited) status = 'NOT_ANSWERED';

  return (
    // react-window v2 provides the positioning style — apply it to the outer wrapper.
    // Center the button within the cell so the gap renders as empty space around it.
    <div style={style} className="flex items-center justify-center">
      <PaletteButton
        questionNumber={q.questionNumber}
        isCurrent={isCurrent}
        status={status}
        onClick={() => setCurrentQuestion(index)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// QuestionPalette
// ---------------------------------------------------------------------------

export function QuestionPalette() {
  const activeTestQuestions = useTestStore(s => s.activeTestQuestions);
  const {
    currentSubject,
    currentQuestionIndex,
    setCurrentQuestion,
    answers,
    reviewFlags,
    visitedQuestions,
  } = useSessionStore(
    useShallow(s => ({
      currentSubject: s.currentSubject,
      currentQuestionIndex: s.currentQuestionIndex,
      setCurrentQuestion: s.setCurrentQuestion,
      answers: s.answers,
      reviewFlags: s.reviewFlags,
      visitedQuestions: s.visitedQuestions,
    }))
  );

  const currentSubjectQuestions = useMemo(
    () => activeTestQuestions.filter(q => q.subject === currentSubject),
    [activeTestQuestions, currentSubject]
  );

  // Aggregate counts — identical logic to before, not affected by virtualization
  const counts = useMemo(() => {
    let answered = 0, notAnswered = 0, review = 0, answeredReview = 0, notVisited = 0;
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

  // The palette panel is w-72 (288px). Padding is p-4 (16px each side) = 32px total.
  // Available width for buttons: 288 - 32 = 256px.
  // How many columns of CELL_STRIDE (52px) fit? floor(256 / 52) = 4.
  // We hard-code to 4 columns since the panel width is fixed by the Tailwind class.
  // If the panel ever becomes resizable, switch to an onResize handler here.
  const PANEL_INNER_WIDTH = 256; // 288 - 2*16
  const columnCount = Math.max(1, Math.floor((PANEL_INNER_WIDTH + GAP) / CELL_STRIDE));
  const rowCount = Math.ceil(currentSubjectQuestions.length / columnCount);

  const rowKey = useCallback(
    ({ rowIndex }: { rowIndex: number; data: PaletteCellData }) => `row-${rowIndex}`,
    []
  );
  const columnKey = useCallback(
    ({ rowIndex, columnIndex, data }: { rowIndex: number; columnIndex: number; data: PaletteCellData }) => {
      const index = rowIndex * data.columnCount + columnIndex;
      return index < data.questions.length ? data.questions[index].id : `empty-${rowIndex}-${columnIndex}`;
    },
    []
  );

  // The cellProps object is memoized by react-window v2 automatically,
  // but we still stable-reference it to avoid unnecessary Grid re-renders.
  const cellProps: PaletteCellData = useMemo(
    () => ({
      questions: currentSubjectQuestions,
      answers,
      reviewFlags,
      visitedQuestions,
      currentQuestionIndex,
      columnCount,
      setCurrentQuestion,
    }),
    [currentSubjectQuestions, answers, reviewFlags, visitedQuestions, currentQuestionIndex, columnCount, setCurrentQuestion]
  );

  return (
    <div className="w-full lg:w-72 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-300 flex flex-col h-64 lg:h-full shrink-0">
      {/* Legend — identical markup to original */}
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
          Answered &amp; Marked for Review (will be considered for evaluation)
        </div>
      </div>

      <div className="p-4 bg-blue-100/50 border-b border-gray-300 font-bold text-blue-900">
        {currentSubject}
      </div>

      {/* Virtualized button grid — react-window v2 Grid with built-in resize handling */}
      <div className="flex-1 overflow-hidden p-4">
        <Grid
          cellComponent={PaletteCell}
          cellProps={cellProps}
          columnCount={columnCount}
          columnWidth={CELL_STRIDE}
          rowCount={rowCount}
          rowHeight={CELL_STRIDE}
          rowKey={rowKey}
          columnKey={columnKey}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
