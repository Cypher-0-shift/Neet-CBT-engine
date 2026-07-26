import { useSessionStore } from '../../../stores/sessionStore';
import { useTestStore } from '../../../stores/testStore';

export function SubjectTabs() {
  const { currentSubject, setCurrentQuestion } = useSessionStore();
  const { activeTestQuestions } = useTestStore();

  const subjects = Array.from(new Set(activeTestQuestions.map((q) => q.subject)));

  return (
    <div className="flex bg-gray-100 border-b border-gray-300">
      {subjects.map((subject) => {
        const isActive = subject === currentSubject;
        return (
          <button
            key={subject}
            onClick={() => setCurrentQuestion(0, subject)}
            className={`px-8 py-3 font-semibold text-sm transition-colors border-r border-gray-300 ${
              isActive
                ? 'bg-white text-app-primary border-b-2 border-b-app-primary'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {subject.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
