/**
 * Settings Page
 * Application configuration
 */

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { useSettingsStore } from '../../../stores/settingsStore';
import { ipc } from '../../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';

export function SettingsPage() {
  const navigate = useNavigate();
  const settings = useSettingsStore((s) => s.settings);
  const [backupStatus, setBackupStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateBackup = async () => {
    try {
      setIsProcessing(true);
      setBackupStatus('Creating backup...');
      const res = await ipc(IpcChannel.CREATE_BACKUP, { destinationDir: '' });
      if (res.success) {
        setBackupStatus(`Backup created at: ${res.path}`);
      } else {
        setBackupStatus(`Failed: ${res.error}`);
      }
    } catch (e: any) {
      setBackupStatus(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      setIsProcessing(true);
      setBackupStatus('Selecting backup file...');
      const filePath = await ipc(IpcChannel.OPEN_FILE_DIALOG, { 
        filters: [{ name: 'NEET Backup', extensions: ['neetbackup'] }] 
      });

      if (!filePath) {
        setBackupStatus('Restore cancelled.');
        setIsProcessing(false);
        return;
      }

      setBackupStatus('Restoring backup... App will restart.');
      const res = await ipc(IpcChannel.RESTORE_BACKUP, { sourcePath: filePath });
      if (!res.success) {
        setBackupStatus(`Failed: ${res.error}`);
      }
    } catch (e: any) {
      setBackupStatus(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-app-text-primary">
            Settings
          </h1>
          <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
            ← Home
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-exam-border divide-y divide-exam-border">
          {/* Settings sections */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-app-text-primary mb-2">
              Candidate Defaults
            </h2>
            <p className="text-xs text-app-text-muted">
              Default name: {settings.defaultCandidateName || '(not set)'}
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-sm font-semibold text-app-text-primary mb-2">
              Exam Behaviour
            </h2>
            <p className="text-xs text-app-text-muted">
              Auto fullscreen: {settings.autoFullscreen ? 'Yes' : 'No'}
              <br />
              Auto-save interval: {settings.autoSaveIntervalSeconds}s
              <br />
              Timer warning: {settings.timerWarningMinutes} min
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-sm font-semibold text-app-text-primary mb-2">
              Theme
            </h2>
            <p className="text-xs text-app-text-muted">
              Current: {settings.theme}
            </p>
          </div>

          <div className="p-4">
            <h2 className="text-sm font-semibold text-app-text-primary mb-4">
              Data Management (Phase 14)
            </h2>
            <div className="flex space-x-3 mb-2">
              <Button onClick={handleCreateBackup} disabled={isProcessing}>Create Backup</Button>
              <Button variant="secondary" onClick={handleRestoreBackup} disabled={isProcessing}>Restore Backup</Button>
            </div>
            {backupStatus && (
              <p className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded break-all">
                {backupStatus}
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-app-text-muted mt-4">
          Full settings form will be implemented with Phase 5
        </p>
      </div>
    </div>
  );
}
