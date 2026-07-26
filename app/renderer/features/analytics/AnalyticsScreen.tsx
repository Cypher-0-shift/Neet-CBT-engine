import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { Button } from '../../components/ui/Button';
import { ExamLoader } from '../../components/ui/ExamLoader';
import type { AnalyticsQuestionStatus } from '@shared/types/analytics.types';

export function AnalyticsScreen() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useAnalyticsData(sessionId || '');

  if (loading) {
    return <ExamLoader message="Loading results..." />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 max-w-md text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Results Error</h2>
          <p className="text-slate-600 mb-6">{error || 'Could not load results for this session.'}</p>
          <Button onClick={() => navigate('/history')}>Back to History</Button>
        </div>
      </div>
    );
  }

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}m ${s}s`;
  };

  const getStatusIcon = (status: AnalyticsQuestionStatus) => {
    switch (status) {
      case 'correct': return <CheckCircle className="text-green-600 inline mr-1" size={16} />;
      case 'wrong': return <XCircle className="text-red-500 inline mr-1" size={16} />;
      case 'marked_for_review': return <MinusCircle className="text-amber-500 inline mr-1" size={16} />;
      case 'unattempted': return <MinusCircle className="text-slate-400 inline mr-1" size={16} />;
    }
  };

  const getStatusLabel = (status: AnalyticsQuestionStatus) => {
    switch (status) {
      case 'correct': return 'Correct';
      case 'wrong': return 'Wrong';
      case 'marked_for_review': return 'Marked';
      case 'unattempted': return 'Unattempted';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/library')} className="p-2">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Exam Results</h1>
              <p className="text-sm text-slate-500">Overall Score: <strong className="text-slate-900">{data.overall.totalScore}</strong> / {data.overall.maxScore}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Total Accuracy</div>
            <div className="text-xl font-bold text-slate-900">{data.overall.accuracy.toFixed(1)}%</div>
          </div>
        </div>

        {/* Subject Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {data.subjects.map(sub => (
            <div key={sub.subject} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">{sub.subject}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Marks Scored:</span>
                  <span className="font-medium text-slate-900">{sub.score} / {sub.maxScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Accuracy:</span>
                  <span className="font-medium text-slate-900">{sub.accuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Spent:</span>
                  <span className="font-medium text-slate-900">{formatTime(sub.averageTime * sub.totalQuestions)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Questions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-800">Question Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="px-6 py-3 font-medium">Q.No</th>
                  <th className="px-6 py-3 font-medium">Subject</th>
                  <th className="px-6 py-3 font-medium text-center">Your Answer</th>
                  <th className="px-6 py-3 font-medium text-center">Correct Answer</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Time Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.questions.map((q) => (
                  <tr key={q.questionId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-slate-600 font-medium">#{q.questionNumber}</td>
                    <td className="px-6 py-3 text-slate-800">{q.subject}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium">
                        {q.selectedOptionId || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium">
                        {q.correctOptionId}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="flex items-center font-medium">
                        {getStatusIcon(q.status)}
                        <span className={
                          q.status === 'correct' ? 'text-green-700' :
                          q.status === 'wrong' ? 'text-red-600' : 'text-slate-600'
                        }>{getStatusLabel(q.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-slate-500">
                      {q.timeSpentSeconds}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
