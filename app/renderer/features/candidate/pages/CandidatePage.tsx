/**
 * Candidate Details Page
 * Collects candidate name, registration number, language, and exam mode
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export function CandidatePage() {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-white rounded-lg border border-exam-border p-6">
        <h1 className="text-lg font-semibold text-app-text-primary mb-6 text-center">
          Candidate Details
        </h1>

        <p className="text-sm text-app-text-muted text-center mb-4">
          Test ID: {testId}
        </p>

        <p className="text-center text-sm text-app-text-secondary mb-6">
          Candidate details form will be implemented in Phase 5
        </p>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => navigate('/')}>
            ← Back
          </Button>
          <Button variant="primary" onClick={() => navigate(`/instructions/placeholder`)}>
            Start Instructions →
          </Button>
        </div>
      </div>
    </div>
  );
}
