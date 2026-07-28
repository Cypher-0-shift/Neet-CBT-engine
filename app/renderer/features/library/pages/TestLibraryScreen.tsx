import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, AlertTriangle } from 'lucide-react';
import { Grid } from 'react-window';
import type { CellComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { useTestStore } from '../../../stores/testStore';
import { useSessionStore } from '../../../stores/sessionStore';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { SortMenu, type SortOption } from '../components/SortMenu';
import { TestCard } from '../components/TestCard';
import { EmptyState } from '../components/EmptyState';
import { DetailsPanel } from '../components/DetailsPanel';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { ipc } from '../../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';
import type { Session } from '@shared/types/session.types';
import type { TestSummary } from '@shared/types/test.types';
import { ExamLoader } from '../../../components/ui/ExamLoader';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Approximate height (px) of each TestCard row (including gap). */
const CARD_ROW_HEIGHT = 220;
/** Horizontal gap between cards (px). Matches the original gap-6 = 24px */
const CARD_GAP = 24;

/**
 * Compute how many columns fit for a given container width.
 * Matches the original responsive breakpoints approximately:
 *   < 768px  → 1 col  (md breakpoint)
 *   < 1024px → 2 cols (lg breakpoint)
 *   < 1280px → 3 cols (xl breakpoint)
 *   ≥ 1280px → 4 cols
 */
function computeColumnCount(containerWidth: number): number {
  if (containerWidth < 768) return 1;
  if (containerWidth < 1024) return 2;
  if (containerWidth < 1280) return 3;
  return 4;
}

// ---------------------------------------------------------------------------
// Cell data / renderer
// ---------------------------------------------------------------------------

interface LibraryCellData {
  tests: TestSummary[];
  selectedTestId: string | null;
  columnCount: number;
  onSelect: (id: string) => void;
}

function LibraryCell({
  rowIndex,
  columnIndex,
  style,
  tests,
  selectedTestId,
  columnCount,
  onSelect,
}: CellComponentProps<LibraryCellData>) {
  const index = rowIndex * columnCount + columnIndex;
  if (index >= tests.length) return <div style={style} />;

  const test = tests[index];

  return (
    <div
      style={{
        ...style,
        // Inset the card slightly to reproduce the gap-6 spacing.
        // The cell spans the full CARD_GAP-aware width; we add padding to create gutters.
        paddingRight: columnIndex < columnCount - 1 ? CARD_GAP : 0,
        paddingBottom: CARD_GAP,
      }}
    >
      <TestCard
        test={test}
        selected={selectedTestId === test.id}
        onClick={t => onSelect(t.id)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// TestLibraryScreen
// ---------------------------------------------------------------------------

export function TestLibraryScreen() {
  const navigate = useNavigate();
  const availableTests = useTestStore(s => s.availableTests);
  const fetchAvailableTests = useTestStore(s => s.fetchAvailableTests);
  const isLoadingTests = useTestStore(s => s.isLoadingTests);
  const deleteTest = useTestStore(s => s.deleteTest);
  const resumeSession = useSessionStore(s => s.resumeSession);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent-import');

  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const [incompleteSessions, setIncompleteSessions] = useState<Session[]>([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [sessionToResume, setSessionToResume] = useState<Session | null>(null);

  useEffect(() => {
    fetchAvailableTests();
    loadIncompleteSessions();
  }, [fetchAvailableTests]);

  const loadIncompleteSessions = async () => {
    try {
      const sessions = await ipc(IpcChannel.GET_INCOMPLETE_SESSIONS);
      setIncompleteSessions(sessions);
    } catch (err) {
      console.error('Failed to load incomplete sessions', err);
    }
  };

  const selectedTest = useMemo(
    () => availableTests.find(t => t.id === selectedTestId) || null,
    [availableTests, selectedTestId]
  );

  const filteredAndSortedTests = useMemo(() => {
    let result = [...availableTests];

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(lowerQuery));
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        result = result.filter(t => t.sessionsCount > 0);
      } else if (statusFilter === 'never') {
        result = result.filter(t => t.sessionsCount === 0);
      } else if (statusFilter === 'in-progress') {
        const inProgressTestIds = incompleteSessions.map(s => s.testId);
        result = result.filter(t => inProgressTestIds.includes(t.id));
      }
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'highest-score':
          return 0;
        case 'lowest-score':
          return 0;
        case 'last-attempt':
          return new Date(b.lastAttemptDate || 0).getTime() - new Date(a.lastAttemptDate || 0).getTime();
        case 'most-attempts':
          return b.sessionsCount - a.sessionsCount;
        case 'recent-import':
        default:
          return new Date(b.importDate).getTime() - new Date(a.importDate).getTime();
      }
    });

    return result;
  }, [availableTests, query, statusFilter, sortOption, incompleteSessions]);

  const testHasIncompleteSession = (tId: string) => incompleteSessions.some(s => s.testId === tId);

  const handleStartNewAttempt = () => {
    if (selectedTestId) navigate(`/candidate?testId=${selectedTestId}`);
  };

  const handleResumeClick = () => {
    if (!selectedTestId) return;
    const session = incompleteSessions.find(s => s.testId === selectedTestId);
    if (session) {
      setSessionToResume(session);
      setShowResumeModal(true);
    }
  };

  const confirmResume = async () => {
    if (sessionToResume) {
      try {
        await resumeSession(sessionToResume.id);
        navigate('/exam');
      } catch (err) {
        console.error('Failed to resume', err);
      }
    }
  };

  const handleDiscardSession = async () => {
    if (sessionToResume) {
      try {
        await ipc(IpcChannel.UPDATE_SESSION, {
          sessionId: sessionToResume.id,
          updates: { status: 'ABANDONED' as any },
        });
        await loadIncompleteSessions();
        setShowResumeModal(false);
        setSessionToResume(null);
        handleStartNewAttempt();
      } catch (err) {
        console.error('Failed to discard session', err);
      }
    }
  };

  const confirmDelete = async () => {
    if (selectedTestId) {
      await deleteTest(selectedTestId);
      setSelectedTestId(null);
      setShowDeleteModal(false);
    }
  };

  // Stable columnKey / rowKey callbacks required by react-window v2
  const columnKey = useCallback(
    ({ rowIndex, columnIndex, data }: { rowIndex: number; columnIndex: number; data: LibraryCellData }) => {
      const index = rowIndex * data.columnCount + columnIndex;
      return index < data.tests.length ? data.tests[index].id : `empty-${rowIndex}-${columnIndex}`;
    },
    []
  );

  return (
    <div className="h-full bg-gray-50 flex overflow-hidden">

      {/* Main Library View */}
      <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${selectedTest ? 'mr-0 sm:mr-96' : ''}`}>

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-app-primary text-white rounded-lg flex items-center justify-center mr-4 shadow-sm">
                <Library size={20} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Test Library</h1>
            </div>
            <Button onClick={() => navigate('/import')}>Import Package</Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <SearchBar query={query} onChange={setQuery} />
            <div className="flex items-center gap-4">
              <FilterPanel statusFilter={statusFilter} onStatusChange={setStatusFilter} />
              <div className="w-px h-8 bg-gray-300 mx-2" />
              <SortMenu activeSort={sortOption} onChange={setSortOption} />
            </div>
          </div>
        </header>

        {/* Scrollable Test Grid */}
        <main className="flex-1 min-h-0 p-8 overflow-hidden">
          {isLoadingTests ? (
            <ExamLoader message="Loading tests..." inline />
          ) : availableTests.length === 0 ? (
            <EmptyState type="no-tests" onAction={() => navigate('/import')} />
          ) : filteredAndSortedTests.length === 0 ? (
            <EmptyState type="no-results" onAction={() => { setQuery(''); setStatusFilter('all'); }} />
          ) : (
            /* Virtualized grid — fills remaining height via AutoSizer */
            <AutoSizer
              renderProp={({ width, height }: { width: number | undefined; height: number | undefined }) => {
                const w = width ?? 600;
                const h = height ?? 400;
                const columnCount = computeColumnCount(w);
                // Each column gets an equal share of the full width.
                // The last column has no right-padding (handled in LibraryCell).
                const columnWidth = Math.floor(w / columnCount);
                const rowCount = Math.ceil(filteredAndSortedTests.length / columnCount);

                const cellProps: LibraryCellData = {
                  tests: filteredAndSortedTests,
                  selectedTestId,
                  columnCount,
                  onSelect: setSelectedTestId,
                };

                return (
                  <Grid
                    cellComponent={LibraryCell}
                    cellProps={cellProps}
                    columnCount={columnCount}
                    columnWidth={columnWidth}
                    rowCount={rowCount}
                    rowHeight={CARD_ROW_HEIGHT}
                    columnKey={columnKey}
                    style={{ width: w, height: h }}
                  />
                );
              }}
            />
          )}
        </main>
      </div>

      {/* Slide-out Details Panel */}
      {selectedTest && (
        <div className="fixed top-0 right-0 w-full sm:w-96 h-screen z-10 shadow-2xl sm:shadow-xl">
          <DetailsPanel
            test={selectedTest}
            hasIncompleteSession={testHasIncompleteSession(selectedTest.id)}
            onClose={() => setSelectedTestId(null)}
            onStartNew={handleStartNewAttempt}
            onResume={handleResumeClick}
            onDelete={() => setShowDeleteModal(true)}
          />
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Test">
        <div className="p-4">
          <div className="flex items-start mb-4">
            <AlertTriangle className="text-red-500 mr-3 shrink-0" size={24} />
            <p className="text-gray-700">
              Are you sure you want to delete this test? All associated session history and analytics will be permanently removed. This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete Test</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showResumeModal} onClose={() => setShowResumeModal(false)} title="Incomplete Session Found">
        <div className="p-4">
          <p className="text-gray-700 mb-6">
            You have an unfinished attempt for this test. Would you like to resume where you left off, or discard it and start fresh?
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="danger" onClick={handleDiscardSession}>Discard Session</Button>
            <Button variant="primary" onClick={confirmResume}>Resume Attempt</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
