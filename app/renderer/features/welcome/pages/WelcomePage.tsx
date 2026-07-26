/**
 * Welcome Page — Landing screen
 * Shows app title, import test package button, recent tests, and navigation
 */

import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { ipc } from '../../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';
import type { TestSummary } from '@shared/types/test.types';
import { useEffect, useState } from 'react';
import { formatDate } from '@shared/utils/time.utils';

export function WelcomePage() {
  const navigate = useNavigate();
  const [recentTests, setRecentTests] = useState<TestSummary[]>([]);

  useEffect(() => {
    ipc(IpcChannel.GET_ALL_TESTS).then(setRecentTests).catch(console.error);
  }, []);

  const handleImport = async () => {
    const filePath = await ipc(IpcChannel.OPEN_FILE_DIALOG, {
      filters: [{ name: 'Test Packages', extensions: ['zip'] }],
    });

    if (filePath) {
      navigate('/import', { state: { filePath } });
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      {/* Logo and Title */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-app-primary rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-white">N</span>
        </div>
        <h1 className="text-2xl font-bold text-app-text-primary mb-1">
          NEET CBT Practice
        </h1>
        <p className="text-sm text-app-text-secondary">
          Exam Simulation & Performance Intelligence
        </p>
      </div>

      {/* Primary Action */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleImport}
        className="mb-8"
      >
        📦 Upload Test Package (.zip)
      </Button>

      {/* Recent Tests */}
      {recentTests.length > 0 && (
        <div className="w-full max-w-lg">
          <h2 className="text-sm font-semibold text-app-text-secondary mb-3 uppercase tracking-wide">
            Recent Tests
          </h2>
          <div className="space-y-2">
            {recentTests.map((test) => (
              <button
                key={test.id}
                onClick={() => navigate(`/candidate/${test.id}`)}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-exam-border
                           hover:shadow-exam cursor-pointer transition-shadow duration-100 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-app-text-primary">
                    {test.name}
                  </p>
                  <p className="text-xs text-app-text-secondary">
                    {test.totalQuestions} questions · {test.durationMinutes} min
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-app-text-muted">
                    {formatDate(test.importDate)}
                  </p>
                  {test.sessionsCount > 0 && (
                    <p className="text-xs text-app-accent">
                      {test.sessionsCount} attempt{test.sessionsCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="absolute bottom-6 flex gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
          📊 History
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
          ⚙️ Settings
        </Button>
      </div>
    </div>
  );
}
