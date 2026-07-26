/**
 * Instructions Page
 * Replicates official NTA CBT instructions
 */

import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { useSessionStore } from '../../../stores/sessionStore';

export function InstructionsPage() {
  const navigate = useNavigate();
  const { currentSession } = useSessionStore();

  const handleBegin = () => {
    navigate('/exam');
  };

  const durationMinutes = currentSession ? Math.floor(currentSession.durationSeconds / 60) : 180;

  return (
    <div className="h-full bg-gray-50 flex flex-col items-center p-8 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center border-b pb-4">
          General Instructions
        </h1>

        <div className="text-sm text-gray-700 space-y-4 mb-8">
          <p>Please read the instructions carefully:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              The total duration of the examination is <strong>{durationMinutes} minutes</strong>.
            </li>
            <li>
              The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time available for you to complete the examination.
            </li>
            <li>
              When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.
            </li>
            <li>
              The Question Palette displayed on the right side of screen will show the status of each question.
            </li>
          </ol>
          <p className="mt-4 font-semibold">Navigating to a Question:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>To answer a question, you can click on the question number in the Question Palette to go to that question directly.</li>
            <li>Click on <strong>Save & Next</strong> to save your answer for the current question and then go to the next question.</li>
            <li>Click on <strong>Mark for Review & Next</strong> to save your answer for the current question, mark it for review, and then go to the next question.</li>
          </ul>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-auto">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <Button
            variant="primary"
            onClick={handleBegin}
          >
            I Am Ready To Begin
          </Button>
        </div>
      </div>
    </div>
  );
}
