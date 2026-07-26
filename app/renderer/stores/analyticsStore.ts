import { create } from 'zustand';
import type { AnalyticsReport } from '@shared/types/analytics.types';
import { ipc } from '../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';

interface AnalyticsState {
  currentReport: AnalyticsReport | null;

  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAnalyticsReport: (sessionId: string) => Promise<void>;
  generateAnalytics: (sessionId: string) => Promise<void>;

  clearReport: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  currentReport: null,

  isLoading: false,
  error: null,

  fetchAnalyticsReport: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const report = await ipc(IpcChannel.GET_ANALYTICS_REPORT, { sessionId });
      set({ currentReport: report });
    } catch (error) {
      console.error('Failed to fetch analytics report:', error);
      set({ error: 'Failed to load report.' });
    } finally {
      set({ isLoading: false });
    }
  },

  generateAnalytics: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const report = await ipc(IpcChannel.GENERATE_ANALYTICS, { sessionId });
      set({ currentReport: report });
    } catch (error) {
      console.error('Failed to generate analytics:', error);
      set({ error: 'Failed to generate analytics.' });
    } finally {
      set({ isLoading: false });
    }
  },



  clearReport: () => set({ currentReport: null, error: null })
}));
