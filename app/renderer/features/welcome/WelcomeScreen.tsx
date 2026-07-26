import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Upload, 
  PlayCircle, 
  Settings, 
  Library,
  FileText,
  Brain,
  History
} from 'lucide-react';

import { useTestStore } from '../../stores/testStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ipc } from '../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';
import type { Session } from '@shared/types/session.types';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { availableTests, fetchAvailableTests, isLoadingTests } = useTestStore();

  useEffect(() => {
    fetchAvailableTests();
  }, [fetchAvailableTests]);

  const handleImport = () => navigate('/import');
  const handleSettings = () => navigate('/settings');
  const handleTestClick = (testId: string) => navigate(`/test-summary/${testId}`);

  return (
    <div className="h-full bg-gray-50 flex flex-col items-center justify-center p-8">
      
      {/* Header / Logo */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-app-primary text-white shadow-lg mb-6">
          <GraduationCap size={48} />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">NEET CBT Practice</h1>
        <p className="text-lg text-gray-600">Offline Mock Test Engine</p>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
        <Card className="hover:border-app-primary transition-colors cursor-pointer group" onClick={handleImport}>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-app-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Import Test Package</h2>
            <p className="text-gray-500 text-center">Upload a .zip package containing test data</p>
          </CardContent>
        </Card>

        <Card className="hover:border-app-primary transition-colors cursor-pointer group" onClick={() => navigate('/library')}>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-app-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Library size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Test Library</h2>
            <p className="text-gray-500 text-center">Browse and manage all your imported tests</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tests List */}
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Recent Tests</h3>
          <div className="flex space-x-2">
          </div>
        </div>

        <Card>
          {isLoadingTests ? (
            <div className="p-8 text-center text-gray-500">Loading tests...</div>
          ) : availableTests.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <FileText size={48} className="mb-4 text-gray-300" />
              <p>No tests found. Import a package to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
              {availableTests.map((test) => (
                <div 
                  key={test.id} 
                  className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleTestClick(test.id)}
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{test.name}</h4>
                    <p className="text-sm text-gray-500">
                      {test.totalQuestions} Questions • {test.durationMinutes} Mins
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">Start Practice</Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}
