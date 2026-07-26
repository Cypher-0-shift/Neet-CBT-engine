/**
 * Analytics Page
 * Comprehensive performance dashboard
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export function AnalyticsPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-app-text-primary">
            Performance Analytics
          </h1>
          <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
            ← Home
          </Button>
        </div>

        <p className="text-sm text-app-text-secondary">
          Analytics dashboard with ECharts visualizations will be implemented in Phase 7.
          <br />
          Session: {sessionId}
        </p>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {['Overall Score', 'Accuracy', 'Time Analysis', 'Subject Analysis', 'Topic Analysis', 'Behaviour'].map(
            (section) => (
              <div
                key={section}
                className="bg-white rounded-lg border border-exam-border p-4 h-32 flex items-center justify-center"
              >
                <span className="text-sm text-app-text-muted">{section}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
