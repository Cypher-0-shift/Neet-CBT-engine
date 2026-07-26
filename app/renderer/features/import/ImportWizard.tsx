import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileArchive, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ipc, onMainEvent } from '../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';

export function ImportWizard() {
  const navigate = useNavigate();
  
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<{ step: string; label: string; progress: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onMainEvent(IpcChannel.IMPORT_PROGRESS, (data: any) => {
      setProgress(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectFile = async () => {
    try {
      const filePath = await ipc(IpcChannel.SELECT_IMPORT_PACKAGE);
      if (filePath) {
        setSelectedFile(filePath);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to select file:', err);
      setError('Failed to open file dialog.');
    }
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;
    
    setIsImporting(true);
    setError(null);
    setProgress({ step: 'init', label: 'Preparing to import...', progress: 0 });

    try {
      const result = await ipc(IpcChannel.IMPORT_TEST_PACKAGE, { filePath: selectedFile });
      
      if (result.success && result.testId) {
        setProgress({ step: 'done', label: 'Import complete!', progress: 100 });
        // Small delay to let user see 100%
        setTimeout(() => {
          navigate(`/test-summary/${result.testId}`);
        }, 1000);
      } else {
        setError(result.errors ? result.errors.join(', ') : 'Unknown error occurred during import.');
        setIsImporting(false);
        setProgress(null);
      }
    } catch (err: any) {
      console.error('Import failed:', err);
      setError(err.message || 'Import process failed unexpectedly.');
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    if (isImporting) return; // Disallow cancellation during import to avoid weird state for now
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      
      <div className="w-full max-w-2xl flex items-center mb-8">
        <Button variant="ghost" onClick={handleCancel} disabled={isImporting}>
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>
      </div>

      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Import Test Package</h2>
            <p className="text-gray-600">Upload a NEET practice test ZIP package</p>
          </div>

          {!isImporting && !progress ? (
            <div className="flex flex-col items-center">
              <div 
                className={`w-full p-12 border-2 border-dashed rounded-xl mb-6 flex flex-col items-center justify-center transition-colors
                  ${selectedFile ? 'border-app-primary bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
              >
                <FileArchive size={48} className={selectedFile ? 'text-app-primary mb-4' : 'text-gray-400 mb-4'} />
                {selectedFile ? (
                  <>
                    <p className="font-semibold text-gray-900 mb-1">Package Selected</p>
                    <p className="text-sm text-gray-500 break-all text-center">{selectedFile}</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-gray-900 mb-2">Select a ZIP package to begin</p>
                    <p className="text-sm text-gray-500 mb-4">Must contain metadata.json and questions.json</p>
                  </>
                )}
                
                <Button variant={selectedFile ? 'secondary' : 'primary'} onClick={handleSelectFile} className="mt-4">
                  {selectedFile ? 'Change File' : 'Browse Files'}
                </Button>
              </div>

              {error && (
                <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg flex items-start mb-6">
                  <AlertCircle className="text-red-600 mr-3 shrink-0 mt-0.5" size={20} />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end w-full space-x-4">
                <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                <Button 
                  variant="primary" 
                  disabled={!selectedFile}
                  onClick={handleStartImport}
                >
                  Start Import
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                {progress?.progress === 100 ? (
                  <CheckCircle size={40} className="text-green-500" />
                ) : (
                  <FileArchive size={40} className="text-app-primary animate-pulse" />
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {progress?.progress === 100 ? 'Import Complete' : 'Importing Package...'}
              </h3>
              <p className="text-gray-500 mb-8">{progress?.label || 'Processing...'}</p>
              
              <ProgressBar 
                progress={progress?.progress || 0} 
                className="w-full max-w-md"
              />
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
