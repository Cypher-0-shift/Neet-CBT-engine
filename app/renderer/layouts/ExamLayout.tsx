import React from 'react';
import { Outlet } from 'react-router-dom';
import { useUiStore } from '../stores/uiStore';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';

export const ExamLayout: React.FC = () => {
  const { isGlobalLoading, globalLoadingMessage } = useUiStore();

  return (
    <div className="h-screen w-screen bg-white text-slate-900 flex flex-col overflow-hidden font-sans select-none">
      {/* Strict NTA-style Exam Header - Minimal distractions */}
      <header className="bg-slate-800 text-white px-4 py-2 flex justify-between items-center shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-wide">NEET (UG) - EXAMINATION</h1>
        </div>
        {/* Timer will be injected here by the Exam Feature */}
        <div id="exam-timer-portal"></div>
      </header>

      {/* Main Exam Canvas */}
      <main className="flex-1 flex flex-row overflow-hidden relative">
        <ErrorBoundary fallback={
          <div className="flex flex-col items-center justify-center w-full h-full bg-slate-50">
            <h2 className="text-xl font-bold text-red-600 mb-2">Exam Engine Error</h2>
            <p className="text-slate-600">Please contact the invigilator immediately.</p>
          </div>
        }>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Strict Global Loading Overlay for Exam operations (like saving) */}
      {isGlobalLoading && (
        <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4"></div>
          <p className="text-base font-semibold text-slate-800">{globalLoadingMessage || 'Processing...'}</p>
        </div>
      )}
    </div>
  );
};
