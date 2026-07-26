import { useSessionStore } from '../../../stores/sessionStore';
import { useTestStore } from '../../../stores/testStore';
import { useSettingsStore } from '../../../stores/settingsStore';

export function ExamHeader() {
  const { currentSession, timeRemainingSeconds } = useSessionStore();
  const { activeTestSummary } = useTestStore();
  const { settings } = useSettingsStore();

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-app-primary text-white flex justify-between items-center px-6 py-3 shadow-md shrink-0">
      <div className="flex items-center space-x-6">
        <div>
          <p className="text-xs text-blue-200 uppercase font-bold tracking-wider">Candidate Name</p>
          <p className="font-semibold">{currentSession?.candidateName || 'Unknown Candidate'}</p>
        </div>
        <div className="w-px h-8 bg-blue-700 mx-2" />
        <div>
          <p className="text-xs text-blue-200 uppercase font-bold tracking-wider">Exam Name</p>
          <p className="font-semibold">{activeTestSummary?.name || 'Unknown Exam'}</p>
        </div>
      </div>

      <div className="flex items-center bg-blue-900 rounded-lg px-6 py-2 border border-blue-800 shadow-inner">
        <span className="text-sm text-blue-200 uppercase font-bold mr-3 tracking-widest">Time Left</span>
        <span className={`text-2xl font-mono font-bold ${
          timeRemainingSeconds <= settings.timerCriticalMinutes * 60 
            ? 'text-red-400 animate-pulse' 
            : timeRemainingSeconds <= settings.timerWarningMinutes * 60 
              ? 'text-orange-400' 
              : 'text-white'
        }`}>
          {formatTime(timeRemainingSeconds)}
        </span>
      </div>
    </header>
  );
}
