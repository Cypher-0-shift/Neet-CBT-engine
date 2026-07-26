import { useState, useEffect } from 'react';
import { ipc } from '../../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';
import type { WrongQuestion, BookmarkWithDetails, StudyInsights } from '@shared/types/intelligence.types';

export function useIntelligence() {
  const [bookmarks, setBookmarks] = useState<BookmarkWithDetails[]>([]);
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [insights, setInsights] = useState<StudyInsights | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bmData, wqData, siData] = await Promise.all([
        ipc(IpcChannel.GET_BOOKMARKS),
        ipc(IpcChannel.GET_WRONG_QUESTIONS, { limit: 100, offset: 0 }),
        ipc(IpcChannel.GET_STUDY_INSIGHTS)
      ]);
      setBookmarks(bmData || []);
      setWrongQuestions(wqData?.questions || []);
      setInsights(siData);
    } catch (error) {
      console.error('Failed to load intelligence data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleBookmark = async (questionId: string) => {
    try {
      await ipc(IpcChannel.TOGGLE_BOOKMARK, { questionId });
      // Refresh bookmarks locally or re-fetch
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const saveNote = async (questionId: string, content: string) => {
    try {
      await ipc(IpcChannel.SAVE_NOTE, { questionId, content });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return {
    bookmarks,
    wrongQuestions,
    insights,
    loading,
    toggleBookmark,
    saveNote,
    refresh: loadData
  };
}
