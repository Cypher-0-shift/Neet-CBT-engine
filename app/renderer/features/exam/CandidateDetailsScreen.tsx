import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Hash, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useSessionStore } from '../../stores/sessionStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { ExamMode } from '@shared/types/session.types';

export function CandidateDetailsScreen() {
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId');
  const navigate = useNavigate();
  
  const { createSession, isSaving } = useSessionStore();
  const { settings } = useSettingsStore();
  
  const [name, setName] = useState(settings.defaultCandidateName || '');
  const [registrationNumber, setRegistrationNumber] = useState(settings.defaultRegistrationNumber || '');
  const [mode, setMode] = useState<ExamMode>(ExamMode.EXAM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testId) {
      setError('No test selected. Please return to the library and try again.');
    }
  }, [testId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testId) return;
    
    if (!name.trim() || !registrationNumber.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      setError(null);
      await createSession(testId, {
        name,
        registrationNumber,
        language: 'English', // Hardcoded for now, could add language selector
        mode
      });
      // Session initialized successfully, proceed to instructions
      navigate('/instructions');
    } catch (err: any) {
      console.error('Failed to initialize session:', err);
      setError(err.message || 'Failed to initialize session. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (error && !testId) {
    return (
      <div className="h-full bg-gray-50 flex flex-col items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/library')}>Back to Library</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex items-center justify-center p-8">
      <Card className="w-full max-w-lg shadow-xl">
        <CardContent className="p-10">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Candidate Details</h2>
            <p className="text-gray-500">Please verify your details before starting</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start text-red-700">
              <AlertCircle size={20} className="mr-3 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Candidate Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-app-primary focus:border-app-primary transition-colors"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Registration / Roll Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-app-primary focus:border-app-primary transition-colors uppercase"
                  placeholder="e.g. NEET202612345"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                />
              </div>
            </div>



            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSaving}>
                Proceed to Instructions
              </Button>
            </div>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}
