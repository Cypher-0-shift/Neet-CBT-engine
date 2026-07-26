import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, Bookmark, Brain, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useIntelligence } from './hooks/useIntelligence';
import { RevisionPlannerView } from './views/RevisionPlannerView';
import { WrongQuestionNotebook } from './views/WrongQuestionNotebook';
import { BookmarksGallery } from './views/BookmarksGallery';
import { ExamLoader } from '../../components/ui/ExamLoader';


type ViewMode = 'planner' | 'wrong_notebook' | 'bookmarks';

export function LearningDashboardScreen() {
  const navigate = useNavigate();
  const { bookmarks, wrongQuestions, insights, loading, toggleBookmark, saveNote } = useIntelligence();
  const [activeView, setActiveView] = useState<ViewMode>('planner');

  if (loading) {
    return <ExamLoader message="Loading your intelligence dashboard..." />;
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-gray-900 font-medium text-lg mb-2">Could not load learning insights.</p>
        <Button onClick={() => navigate('/home')}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col no-print">
        <div className="p-6 border-b border-gray-100">
          <Button variant="ghost" className="w-full justify-start text-gray-500 mb-4" onClick={() => navigate('/home')}>
            <ArrowLeft size={18} className="mr-2" />
            Back to Home
          </Button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Brain size={24} className="text-app-primary mr-2" />
            Learning Hub
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveView('planner')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'planner' ? 'bg-blue-50 text-app-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BookOpen size={18} className="mr-3" />
            Smart Planner
          </button>
          <button
            onClick={() => setActiveView('wrong_notebook')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors justify-between ${
              activeView === 'wrong_notebook' ? 'bg-blue-50 text-app-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <AlertCircle size={18} className="mr-3" />
              Mistakes Notebook
            </div>
            {wrongQuestions.length > 0 && (
              <span className="bg-red-100 text-red-600 text-xs py-0.5 px-2 rounded-full font-bold">
                {wrongQuestions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('bookmarks')}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors justify-between ${
              activeView === 'bookmarks' ? 'bg-blue-50 text-app-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <Bookmark size={18} className="mr-3" />
              Bookmarks
            </div>
            {bookmarks.length > 0 && (
              <span className="bg-blue-100 text-blue-600 text-xs py-0.5 px-2 rounded-full font-bold">
                {bookmarks.length}
              </span>
            )}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto pb-12">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeView === 'planner' && 'Your Learning Path'}
              {activeView === 'wrong_notebook' && 'Review Your Mistakes'}
              {activeView === 'bookmarks' && 'Saved for Later'}
            </h1>
            <p className="text-gray-500">
              {activeView === 'planner' && 'AI-driven recommendations based on your performance history.'}
              {activeView === 'wrong_notebook' && 'Re-visiting mistakes is the fastest way to improve.'}
              {activeView === 'bookmarks' && 'Important questions and your personal notes.'}
            </p>
          </header>

          {activeView === 'planner' && <RevisionPlannerView insights={insights} />}
          {activeView === 'wrong_notebook' && (
            <WrongQuestionNotebook 
              questions={wrongQuestions} 
              onToggleBookmark={toggleBookmark}
            />
          )}
          {activeView === 'bookmarks' && (
            <BookmarksGallery 
              bookmarks={bookmarks} 
              onToggleBookmark={toggleBookmark} 
              onSaveNote={saveNote}
            />
          )}
        </div>
      </main>
    </div>
  );
}
