import React, { useState } from 'react';
import { WrongQuestion } from '@shared/types/intelligence.types';
import { Button } from '../../../components/ui/Button';

interface Props {
  questions: WrongQuestion[];
  onToggleBookmark: (id: string) => void;
}

export const WrongQuestionNotebook: React.FC<Props> = ({ questions, onToggleBookmark }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Simple local filtering since we load 100 at a time (could be pushed to backend)
  // But we'll just filter what's in props for now.

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Wrong Question Notebook</h3>
        <div className="text-sm text-gray-500">
          {questions.length} Questions tracked
        </div>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-gray-200 text-gray-500">
            You haven't gotten any questions wrong yet! Great job!
          </div>
        ) : (
          questions.map((wq) => (
            <div key={wq.question.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all">
              <div 
                className="p-5 cursor-pointer hover:bg-gray-50 flex items-start"
                onClick={() => setExpandedId(expandedId === wq.question.id ? null : wq.question.id)}
              >
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm shrink-0 mr-4">
                  {wq.wrongCount}x
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">
                      {wq.question.difficulty}
                    </span>
                    <span className="text-xs text-gray-400">
                      Last Attempt: {new Date(wq.lastAttemptedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-gray-800 text-sm mb-2" dangerouslySetInnerHTML={{ __html: wq.question.questionText }} />
                  {wq.question.questionImagePath && (
                    <img src={wq.question.questionImagePath} alt="Question" className="max-w-xs mt-2 rounded border border-gray-200" />
                  )}
                </div>
              </div>

              {expandedId === wq.question.id && (
                <div className="p-5 bg-gray-50 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Solution</h4>
                  <div className="text-gray-700 text-sm mb-4" dangerouslySetInnerHTML={{ __html: wq.question.solutionText || 'No solution text provided.' }} />
                  {wq.question.solutionImagePath && (
                    <img src={wq.question.solutionImagePath} alt="Solution" className="max-w-md rounded border border-gray-200 mb-4" />
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                    <Button variant="secondary" size="sm" onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onToggleBookmark(wq.question.id);
                    }}>
                      Bookmark for Review
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
