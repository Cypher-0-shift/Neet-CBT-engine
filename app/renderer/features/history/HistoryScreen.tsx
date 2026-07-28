import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Award, CheckCircle, XCircle } from 'lucide-react';
import { List } from 'react-window';
import type { RowComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ipc } from '../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';
import type { Session } from '@shared/types/session.types';
import { useTestStore } from '../../stores/testStore';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Approximate height (px) of each history session card. */
const SESSION_ROW_HEIGHT = 120;

// ---------------------------------------------------------------------------
// Row data passed through react-window v2's rowProps mechanism
// ---------------------------------------------------------------------------

interface HistoryRowData {
  sessions: Session[];
  getTestName: (testId: string) => string;
  navigate: (path: string) => void;
}

/**
 * Row renderer for react-window v2 List.
 * Receives { index, style, ariaAttributes, ...rowProps }.
 */
function SessionRow({ index, style, sessions, getTestName, navigate }: RowComponentProps<HistoryRowData>) {
  const session = sessions[index];

  return (
    <div style={style} className="px-1 py-2">
      <Card className="hover:border-blue-200 transition-colors h-full">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between h-full">
          <div className="flex-1 mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{getTestName(session.testId)}</h3>
            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-y-1">
              <span className="mr-4"><strong>Candidate:</strong> {session.candidateName}</span>
              <span className="mr-4"><strong>Date:</strong> {new Date(session.startTime).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center justify-between w-full md:w-auto md:space-x-8">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Score</p>
              <p className="text-2xl font-bold text-blue-600">{session.totalScore ?? 0}</p>
            </div>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center text-green-600">
                <CheckCircle size={16} className="mr-1" />
                <span>{session.totalCorrect ?? 0}</span>
              </div>
              <div className="flex items-center text-red-500">
                <XCircle size={16} className="mr-1" />
                <span>{session.totalIncorrect ?? 0}</span>
              </div>
            </div>
            <Button variant="secondary" onClick={() => navigate(`/results/${session.id}`)}>
              View Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HistoryScreen
// ---------------------------------------------------------------------------

export function HistoryScreen() {
  const navigate = useNavigate();
  const availableTests = useTestStore(s => s.availableTests);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getTestName = useCallback(
    (testId: string) => availableTests.find(t => t.id === testId)?.name || testId,
    [availableTests]
  );

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await ipc(IpcChannel.GET_HISTORY);
        setSessions(history || []);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, []);

  // Stable rowKey callback — required by react-window v2
  const rowKey = useCallback(
    (index: number, data: HistoryRowData) => data.sessions[index]?.id ?? `row-${index}`,
    []
  );

  return (
    <div className="w-full max-w-4xl mx-auto py-8 h-full flex flex-col">
      <div className="flex items-center mb-8 shrink-0">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-4">
          <History size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test History</h1>
          <p className="text-gray-500">Review your past performance and submitted exams</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 shrink-0">Loading history...</div>
      ) : sessions.length === 0 ? (
        <Card className="shrink-0">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <Award size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No past exams found</h2>
            <p className="text-gray-500 mb-6 max-w-md">
              You haven't completed any mock tests yet. Take a test from the library to see your performance history here.
            </p>
            <Button variant="primary" onClick={() => navigate('/library')}>Go to Test Library</Button>
          </CardContent>
        </Card>
      ) : (
        /* Virtualized list — fills remaining height via flex-1 */
        <div className="flex-1 min-h-0">
          <AutoSizer
              renderProp={({ width, height }: { width: number | undefined; height: number | undefined }) => (
              <List
                rowComponent={SessionRow}
                rowProps={{ sessions, getTestName, navigate }}
                rowCount={sessions.length}
                rowHeight={SESSION_ROW_HEIGHT}
                rowKey={rowKey}
                style={{ width: width ?? '100%', height: height ?? 600 }}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}
