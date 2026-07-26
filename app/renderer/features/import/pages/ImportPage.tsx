/**
 * Import Page — Shows ZIP import pipeline progress
 * Phase 4 will implement the full pipeline. This is the UI shell.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

const IMPORT_STEPS = [
  { key: 'extracting', label: 'Extracting Package...' },
  { key: 'reading_metadata', label: 'Reading Metadata...' },
  { key: 'reading_questions', label: 'Reading Questions...' },
  { key: 'reading_answers', label: 'Reading Answers...' },
  { key: 'loading_images', label: 'Loading Images...' },
  { key: 'validating', label: 'Validating References...' },
  { key: 'saving', label: 'Saving to Database...' },
  { key: 'ready', label: 'Ready' },
] as const;

export function ImportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const filePath = (location.state as { filePath?: string })?.filePath;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-lg font-semibold text-app-text-primary mb-6 text-center">
          Importing Test Package
        </h1>

        {filePath && (
          <p className="text-xs text-app-text-muted text-center mb-6 truncate">
            {filePath}
          </p>
        )}

        {/* Pipeline Steps */}
        <div className="space-y-3 mb-8">
          {IMPORT_STEPS.map((step, idx) => (
            <div
              key={step.key}
              className="flex items-center gap-3 text-sm"
            >
              <div className="w-6 h-6 rounded-full border-2 border-exam-border flex items-center justify-center text-xs text-app-text-muted">
                {idx + 1}
              </div>
              <span className="text-app-text-secondary">{step.label}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-app-text-muted mb-4">
          Import pipeline will be implemented in Phase 4
        </p>

        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/')}>
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
