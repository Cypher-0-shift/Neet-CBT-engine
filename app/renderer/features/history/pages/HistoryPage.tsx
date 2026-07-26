/**
 * History Page
 * Lists all past exam sessions with key metrics
 */

import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export function HistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-app-text-primary">
            Test History
          </h1>
          <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
            ← Home
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-exam-border p-8 text-center">
          <p className="text-sm text-app-text-muted">
            No tests taken yet. Import a test package to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
