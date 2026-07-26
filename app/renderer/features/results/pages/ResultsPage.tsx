/**
 * Results Page
 * Shows score summary after exam submission
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export function ResultsPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-white rounded-lg border border-exam-border p-6 text-center">
        <h1 className="text-lg font-semibold text-app-text-primary mb-4">
          Exam Complete
        </h1>

        <p className="text-sm text-app-text-secondary mb-6">
          Results and score summary will be displayed here.
          <br />
          Session: {sessionId}
        </p>

        <div className="flex justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => navigate(`/analytics/${sessionId}`)}
          >
            📊 View Analytics
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            ← Home
          </Button>
        </div>
      </div>
    </div>
  );
}
