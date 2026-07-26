import { Button } from '../../../components/ui/Button';

interface NavigationBarProps {
  onClearResponse: () => void;
  onMarkForReview: () => void;
  onPrevious: () => void;
  onSaveAndNext: () => void;
  onSubmitExam: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  isReviewMarked: boolean;
  hasAnswer: boolean;
}

export function NavigationBar({
  onClearResponse,
  onMarkForReview,
  onPrevious,
  onSaveAndNext,
  onSubmitExam,
  isFirstQuestion,
  isReviewMarked,
  hasAnswer
}: NavigationBarProps) {
  return (
    <div className="bg-gray-100 border-t border-gray-300 p-4 flex flex-col md:flex-row justify-between items-center shrink-0 gap-4 md:gap-0">
      <div className="flex w-full md:w-auto space-x-2 md:space-x-4 justify-between md:justify-start">
        <Button 
          variant="secondary" 
          onClick={onMarkForReview}
        >
          {isReviewMarked ? 'Unmark Review' : 'Mark for Review & Next'}
        </Button>
        <Button 
          variant="secondary" 
          onClick={onClearResponse}
          disabled={!hasAnswer && !isReviewMarked}
        >
          Clear Response
        </Button>
      </div>

      <div className="flex w-full md:w-auto space-x-2 md:space-x-4 justify-between md:justify-start overflow-x-auto pb-2 md:pb-0">
        <Button 
          variant="secondary" 
          onClick={onPrevious}
          disabled={isFirstQuestion}
        >
          {'<< Previous'}
        </Button>
        
        <Button 
          variant="primary" 
          onClick={onSaveAndNext}
        >
          {'Save & Next >>'}
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <Button 
          className="bg-red-600 hover:bg-red-700 text-white" 
          onClick={onSubmitExam}
        >
          End Exam
        </Button>
      </div>
    </div>
  );
}
