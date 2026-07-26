/**
 * Exam Page — CBT Engine
 * This is the core exam simulation screen.
 * Full NTA CBT interface will be implemented in Phase 5.
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export function ExamPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <div className="h-full flex flex-col">
      {/* Exam Header */}
      <div className="exam-header px-4 py-2 flex items-center justify-between">
        <div className="text-exam-header text-white">
          <span className="font-semibold">NEET CBT Practice</span>
          <span className="ml-4 opacity-75">Session: {sessionId}</span>
        </div>
        <div className="text-timer font-mono text-exam-timer-normal font-bold">
          03:20:00
        </div>
      </div>

      {/* Exam Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Panel */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          <p className="text-center text-app-text-secondary mt-20">
            CBT Exam Engine will be implemented in Phase 5
          </p>
          <p className="text-center text-sm text-app-text-muted mt-2">
            This will include question display, options, subject tabs,
            and navigation controls matching the NTA CBT interface.
          </p>
        </div>

        {/* Question Palette Sidebar */}
        <div className="exam-sidebar w-64 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-app-text-secondary uppercase mb-3">
            Question Palette
          </h3>
          <p className="text-xs text-app-text-muted">
            Palette will show question statuses here
          </p>
        </div>
      </div>

      {/* Exam Footer */}
      <div className="exam-footer px-4 py-2 flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            Mark for Review
          </Button>
          <Button variant="secondary" size="sm">
            Clear Response
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            ← Previous
          </Button>
          <Button variant="primary" size="sm">
            Save & Next →
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => navigate(`/results/${sessionId}`)}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
