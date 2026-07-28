import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../stores/sessionStore';
import { useReviewStats } from './hooks/useReviewStats';
import { useSubmission } from './hooks/useSubmission';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ExamHeader } from '../exam/components/ExamHeader';
import { ipc } from '../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';

export function ReviewScreen() {
  const navigate = useNavigate();
  const currentSession = useSessionStore(s => s.currentSession);
  const stats = useReviewStats();
  const { submitExam, isSubmitting, error } = useSubmission();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  if (!currentSession) {
    return <div className="p-8">No active session found.</div>;
  }

  const totalAttempted = stats.answered + stats.answeredAndMarkedForReview;
  const totalUnattempted = stats.totalQuestions - totalAttempted;

  return (
    <div className="h-full w-full flex flex-col bg-gray-50 overflow-hidden font-sans select-none">
      <ExamHeader />

      <div className="flex-1 flex flex-col overflow-hidden px-6 py-3 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex-1 flex flex-col overflow-hidden">
          <h1 className="text-lg font-semibold mb-3 text-gray-800">Exam Summary</h1>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <StatCard label="Total Questions" value={stats.totalQuestions} />
            <StatCard label="Answered" value={stats.answered} color="text-green-600" />
            <StatCard label="Not Answered" value={stats.notAnswered} color="text-red-500" />
            <StatCard label="Marked for Review" value={stats.markedForReview} color="text-purple-600" />
            <StatCard label="Answered & Marked" value={stats.answeredAndMarkedForReview} color="text-purple-600" />
            <StatCard label="Not Visited" value={stats.notVisited} color="text-gray-400" />
          </div>

          <h2 className="text-base font-medium mb-2 text-gray-800 border-b pb-1">Subject Breakdown</h2>
          {/* Only this table scrolls if subjects overflow */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs">
                  <th className="p-2 border-b">Subject</th>
                  <th className="p-2 border-b text-center">Total</th>
                  <th className="p-2 border-b text-center">Answered</th>
                  <th className="p-2 border-b text-center">Not Answered</th>
                  <th className="p-2 border-b text-center">Review</th>
                  <th className="p-2 border-b text-center">Ans & Review</th>
                  <th className="p-2 border-b text-center">Not Visited</th>
                </tr>
              </thead>
              <tbody>
                {stats.subjects.map(sub => (
                  <tr key={sub.subject} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium text-gray-700">{sub.subject}</td>
                    <td className="p-2 text-center">{sub.totalQuestions}</td>
                    <td className="p-2 text-center text-green-600">{sub.answered}</td>
                    <td className="p-2 text-center text-red-500">{sub.notAnswered}</td>
                    <td className="p-2 text-center text-purple-600">{sub.markedForReview}</td>
                    <td className="p-2 text-center text-purple-600">{sub.answeredAndMarkedForReview}</td>
                    <td className="p-2 text-center text-gray-400">{sub.notVisited}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded my-2 border border-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 mt-3 shrink-0">
          <Button variant="secondary" size="lg" onClick={() => navigate('/exam')} disabled={isSubmitting}>
            Return to Exam
          </Button>
          <Button variant="primary" size="lg" onClick={() => setIsSubmitModalOpen(true)} disabled={isSubmitting}>
            Final Submit
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => !isSubmitting && setIsSubmitModalOpen(false)}
        title="Confirm Submission"
      >
        <div className="p-6">
          <div className="mb-6 text-gray-700 space-y-4">
            <p className="font-semibold text-lg text-red-600">Are you sure you want to submit the exam?</p>
            <p>You have attempted <strong>{totalAttempted}</strong> out of <strong>{stats.totalQuestions}</strong> questions.</p>
            {totalUnattempted > 0 && (
              <p className="text-amber-600">You still have <strong>{totalUnattempted}</strong> unanswered questions.</p>
            )}
            <p className="text-sm bg-gray-100 p-3 rounded mt-4">
              Once submitted, you will not be able to change your answers. This action is irreversible.
            </p>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsSubmitModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white" 
              onClick={submitExam}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Yes, Submit Exam'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ label, value, color = "text-gray-900" }: { label: string, value: number, color?: string }) {
  return (
    <div className="bg-gray-50 p-3 rounded border border-gray-100 flex flex-col items-center justify-center text-center">
      <span className={`text-2xl font-bold mb-1 ${color}`}>{value}</span>
      <span className="text-xs text-gray-600 font-medium">{label}</span>
    </div>
  );
}
