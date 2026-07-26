import { Clock, CheckCircle2, CircleDashed, FileText, Calendar } from 'lucide-react';
import type { TestSummary } from '@shared/types/test.types';

interface TestCardProps {
  test: TestSummary;
  onClick: (test: TestSummary) => void;
  selected?: boolean;
}

export function TestCard({ test, onClick, selected }: TestCardProps) {
  // Derive status heuristically for UI if not strictly passed
  const isCompleted = test.sessionsCount > 0;
  
  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div
      onClick={() => onClick(test)}
      className={`relative rounded-xl p-5 border transition-all cursor-pointer ${
        selected 
          ? 'border-app-primary bg-blue-50/50 shadow-md ring-1 ring-app-primary' 
          : 'border-gray-200 bg-white hover:border-app-primary hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-900 leading-tight pr-4 truncate">
          {test.name}
        </h3>
        <div className="shrink-0 flex items-center space-x-1">
          {isCompleted ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle2 size={12} className="mr-1" /> Completed
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              <CircleDashed size={12} className="mr-1" /> Never Attempted
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <FileText size={16} className="text-gray-400 mr-2 shrink-0" />
          <span>{test.totalQuestions} Questions</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock size={16} className="text-gray-400 mr-2 shrink-0" />
          <span>{formatDuration(test.durationMinutes)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-[10px] mr-2 shrink-0">M</span>
          <span>{test.maxMarks} Marks</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar size={16} className="text-gray-400 mr-2 shrink-0" />
          <span className="truncate">Imp: {new Date(test.importDate).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500 font-medium">
          Attempts: {test.sessionsCount}
        </span>
        {test.lastAttemptDate && (
          <span className="text-xs text-gray-500">
            Last: {new Date(test.lastAttemptDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
