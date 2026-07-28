import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { Button } from './Button';
import { ipc } from '../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';
import { useSessionStore } from '../../stores/sessionStore';
import { SessionStatus, type Session } from '@shared/types/session.types';

export function AppRecoveryDialog() {
  const [incompleteSession, setIncompleteSession] = useState<Session | null>(null);
  const resumeSession = useSessionStore(s => s.resumeSession);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for incomplete sessions on mount
    const checkRecovery = async () => {
      try {
        const sessions = await ipc(IpcChannel.GET_INCOMPLETE_SESSIONS);
        if (sessions && sessions.length > 0) {
          // Present the most recent incomplete session
          // Assuming sessions are sorted by latest, or we pick the first
          setIncompleteSession(sessions[0]);
        }
      } catch (err) {
        console.error('Failed to check incomplete sessions', err);
      }
    };
    checkRecovery();
  }, []);

  const handleResume = async () => {
    if (!incompleteSession) return;
    try {
      await resumeSession(incompleteSession.id);
      navigate('/exam');
      setIncompleteSession(null);
    } catch (err) {
      console.error('Failed to resume session', err);
      alert('Failed to resume session. Data might be corrupted.');
    }
  };

  const handleDiscard = async () => {
    if (!incompleteSession) return;
    try {
      await ipc(IpcChannel.UPDATE_SESSION, {
        sessionId: incompleteSession.id,
        updates: { status: SessionStatus.ABANDONED }
      });
      setIncompleteSession(null);
    } catch (err) {
      console.error('Failed to abandon session', err);
    }
  };

  if (!incompleteSession) return null;

  return (
    <Modal
      isOpen={true}
      onClose={() => {}} // Force user to choose
      title="Session Recovery"
    >
      <div className="p-6">
        <p className="text-gray-700 mb-4">
          An unfinished examination session was detected. Would you like to resume?
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6 text-sm">
          <p><strong>Candidate:</strong> {incompleteSession.candidateName}</p>
          <p><strong>Started:</strong> {new Date(incompleteSession.startTime).toLocaleString()}</p>
          <p><strong>Time Remaining:</strong> {Math.floor(incompleteSession.timeRemainingSeconds / 60)} minutes</p>
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={handleDiscard}>
            Discard Session
          </Button>
          <Button variant="primary" onClick={handleResume}>
            Resume Exam
          </Button>
        </div>
      </div>
    </Modal>
  );
}
