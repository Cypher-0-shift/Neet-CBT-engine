import { Play, Trash2, X, RotateCcw, Clock, Target, FileText, Calendar, BookOpen } from 'lucide-react';
import type { TestSummary } from '@shared/types/test.types';
import { Button } from '../../../components/ui/Button';

interface DetailsPanelProps {
  test: TestSummary;
  hasIncompleteSession: boolean;
  onClose: () => void;
  onStartNew: () => void;
  onResume: () => void;
  onDelete: () => void;
}

export function DetailsPanel({
  test,
  hasIncompleteSession,
  onClose,
  onStartNew,
  onResume,
  onDelete,
}: DetailsPanelProps) {
  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="w-full h-full bg-white border-l border-gray-200 shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900 truncate pr-4">{test.name}</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* Core Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-app-primary flex items-center justify-center mr-3">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Duration</p>
              <p className="text-lg font-bold text-gray-900">{formatDuration(test.durationMinutes)}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-app-primary flex items-center justify-center mr-3">
              <Target size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Max Marks</p>
              <p className="text-lg font-bold text-gray-900">{test.maxMarks}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-app-primary flex items-center justify-center mr-3">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Questions</p>
              <p className="text-lg font-bold text-gray-900">{test.totalQuestions}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-app-primary flex items-center justify-center mr-3">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Imported</p>
              <p className="text-sm font-bold text-gray-900">{new Date(test.importDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center">
            <BookOpen size={16} className="mr-2 text-gray-400" />
            Subject Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(test.subjectDistribution)
              .filter(([_, count]) => count > 0)
              .map(([subject, count]) => (
                <div key={subject} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700 capitalize">{subject}</span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-semibold">{count} Qs</span>
                </div>
              ))}
          </div>
        </div>

        {/* History Details */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
            Attempt History
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total Attempts</span>
              <span className="font-bold text-gray-900">{test.sessionsCount}</span>
            </div>
            {test.lastAttemptDate && (
              <div className="flex justify-between">
                <span>Last Attempt</span>
                <span className="font-bold text-gray-900">{new Date(test.lastAttemptDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Best Score</span>
              <span className="text-gray-400 italic">Not available yet</span>
            </div>
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-3">
        {hasIncompleteSession ? (
          <Button variant="primary" className="w-full" size="lg" onClick={onResume}>
            <RotateCcw size={18} className="mr-2" />
            Resume Incomplete Session
          </Button>
        ) : null}

        <Button 
          variant={hasIncompleteSession ? 'secondary' : 'primary'} 
          className="w-full" 
          size="lg" 
          onClick={onStartNew}
        >
          <Play size={18} className="mr-2" />
          Start New Attempt
        </Button>

        <Button variant="danger" className="w-full mt-4" onClick={onDelete}>
          <Trash2 size={18} className="mr-2" />
          Delete Test
        </Button>
      </div>

    </div>
  );
}
