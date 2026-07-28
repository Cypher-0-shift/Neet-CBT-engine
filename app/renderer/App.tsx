import React, { useEffect, Component, ErrorInfo, Suspense, lazy } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full border border-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Error</h2>
            <p className="text-gray-600 mb-6">Something went wrong while rendering the application. Please restart the app.</p>
            <div className="bg-red-50 text-red-800 p-4 rounded text-left overflow-auto text-sm font-mono max-h-64 mb-6">
              <p className="font-bold mb-2">{this.state.error?.toString()}</p>
              <pre className="whitespace-pre-wrap text-xs">{this.state.error?.stack}</pre>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import { StandardLayout } from './layouts/StandardLayout';
import { ExamLayout } from './layouts/ExamLayout';

// Features (Lazy loaded where appropriate, but for now direct imports for scaffolding)
import { WelcomeScreen } from './features/welcome/WelcomeScreen';
import { ImportWizard } from './features/import/ImportWizard';
import { TestSummaryScreen } from './features/exam/TestSummaryScreen';
import { CandidateDetailsScreen } from './features/exam/CandidateDetailsScreen';
import { InstructionsScreen } from './features/exam/InstructionsScreen';
import { ExamScreen } from './features/exam/ExamScreen';
import { ReviewScreen } from './features/review/ReviewScreen';
const AnalyticsScreen = lazy(() => import('./features/analytics/AnalyticsScreen').then(m => ({ default: m.AnalyticsScreen })));
import { HistoryScreen } from './features/history/HistoryScreen';

import { SettingsScreen } from './features/settings/SettingsScreen';
import { TestLibraryScreen } from './features/library/pages/TestLibraryScreen';

import { useSettingsStore } from './stores/settingsStore';
import { useUiStore } from './stores/uiStore';

const AppContent: React.FC = () => {
  const { loadSettings, isLoaded } = useSettingsStore();
  const { setGlobalLoading } = useUiStore();

  useEffect(() => {
    // Initial Hydration
    const hydrate = async () => {
      setGlobalLoading(true, 'Initializing...');
      await loadSettings();
      // Future: Check for incomplete sessions and prompt recovery here
      setGlobalLoading(false);
    };
    hydrate();
  }, [loadSettings, setGlobalLoading]);

  if (!isLoaded) return null; // Avoid flicker

  return (
    <>
      <Routes>
      {/* Standard Application Flow */}
      <Route element={<StandardLayout />}>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/library" element={<TestLibraryScreen />} />
        <Route path="/import" element={<ImportWizard />} />
        <Route path="/test-summary/:testId" element={<TestSummaryScreen />} />
        <Route path="/candidate" element={<CandidateDetailsScreen />} />
        <Route path="/instructions" element={<InstructionsScreen />} />
        <Route path="/results/:sessionId" element={
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading Report...</div>}>
            <AnalyticsScreen />
          </Suspense>
        } />
        <Route path="/history" element={<HistoryScreen />} />

        <Route path="/settings" element={<SettingsScreen />} />
      </Route>

      {/* Strict Isolated Exam Flow */}
      <Route element={<ExamLayout />}>
        <Route path="/exam" element={<ExamScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
      </Route>
    </Routes>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <MemoryRouter>
        <AppContent />
      </MemoryRouter>
    </ErrorBoundary>
  );
};

export default App;
