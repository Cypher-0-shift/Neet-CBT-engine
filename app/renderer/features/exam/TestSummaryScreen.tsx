import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, Target, BookOpen, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ipc } from '../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';
import type { TestSummary } from '@shared/types/test.types';
import { ExamLoader } from '../../components/ui/ExamLoader';


export function TestSummaryScreen() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testId) {
      setError('No Test ID provided');
      setIsLoading(false);
      return;
    }

    const loadSummary = async () => {
      try {
        const data = await ipc(IpcChannel.GET_TEST_SUMMARY, { testId });
        if (data) {
          setSummary(data);
        } else {
          setError('Test not found in database.');
        }
      } catch (err) {
        console.error('Failed to load test summary', err);
        setError('Failed to load test summary.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, [testId]);

  const handleContinue = () => {
    navigate(`/candidate?testId=${testId}`);
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (isLoading) {
    return <ExamLoader message="Loading test details..." />;
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8 flex flex-col items-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Test</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button onClick={handleCancel}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
  };

  return (
    <div className="h-full bg-gray-50 p-8 flex flex-col items-center">
      
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={handleCancel}>
          <ArrowLeft size={20} className="mr-2" />
          Cancel
        </Button>
      </div>

      <Card className="w-full max-w-3xl border-t-4 border-t-app-primary">
        <CardContent className="p-10">
          
          <div className="text-center border-b border-gray-100 pb-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{summary.name}</h1>
            <p className="text-gray-500">Imported on {new Date(summary.importDate).toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <Clock className="text-app-primary mb-2" size={24} />
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Duration</span>
              <span className="text-lg font-bold text-gray-900">{formatDuration(summary.durationMinutes)}</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <FileText className="text-app-primary mb-2" size={24} />
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Questions</span>
              <span className="text-lg font-bold text-gray-900">{summary.totalQuestions}</span>
            </div>

            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <Target className="text-app-primary mb-2" size={24} />
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Max Marks</span>
              <span className="text-lg font-bold text-gray-900">{summary.maxMarks}</span>
            </div>

            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <BookOpen className="text-app-primary mb-2" size={24} />
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Subjects</span>
              <span className="text-lg font-bold text-gray-900">
                {Object.keys(summary.subjectDistribution).filter(k => summary.subjectDistribution[k as keyof typeof summary.subjectDistribution] > 0).length}
              </span>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Subject Breakdown</h3>
            <div className="space-y-3">
              {Object.keys(summary.subjectDistribution)
                .filter(subject => summary.subjectDistribution[subject as keyof typeof summary.subjectDistribution] > 0)
                .map((subject) => (
                <div key={subject} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded transition-colors">
                  <span className="font-medium text-gray-700 capitalize">{subject.toLowerCase()}</span>
                  <span className="text-sm text-gray-500 font-medium px-3 py-1 bg-gray-100 rounded-full">Included</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <Button variant="ghost" size="lg" onClick={handleCancel}>Cancel</Button>
            <Button variant="primary" size="lg" onClick={handleContinue} className="min-w-[160px]">
              Continue
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
