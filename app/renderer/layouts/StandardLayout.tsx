import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useUiStore } from '../stores/uiStore';
import { ExamLoader } from '../components/ui/ExamLoader';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';


export const StandardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isGlobalLoading, globalLoadingMessage } = useUiStore();

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* NTA-style generic header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">N</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">NEET CBT Practice</h1>
        </div>
        <nav className="flex gap-6">
          <button onClick={() => navigate('/')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Home</button>
          <button onClick={() => navigate('/history')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">History</button>
          <button onClick={() => navigate('/settings')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Settings</button>
        </nav>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {location.pathname !== '/' && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 shrink-0">
            <button 
              onClick={() => navigate(-1)} 
              className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm"
              aria-label="Go back"
            >
              <ChevronLeft size={16} className="mr-1" />
              Back
            </button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto flex flex-col w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Loading Overlay */}
      {isGlobalLoading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <ExamLoader message={globalLoadingMessage || 'Loading...'} />
        </div>
      )}
    </div>
  );
};
