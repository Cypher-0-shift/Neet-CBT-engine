import { useState, useEffect } from 'react';
import { ipc } from '../../../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';
import type { AnalyticsReport } from '@shared/types/analytics.types';

export function useAnalyticsData(sessionId: string) {
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No Session ID provided');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        // We first try to get the existing report. If it doesn't exist, we generate it.
        // The AnalyticsEngine from Phase 11 persists it in the DB.
        let report = await ipc(IpcChannel.GET_ANALYTICS_REPORT, { sessionId });
        
        if (!report) {
          console.log('No report found, generating new one...');
          report = await ipc(IpcChannel.GENERATE_ANALYTICS, { sessionId });
        }
        
        setData(report);
      } catch (err: any) {
        console.error('Failed to load analytics', err);
        setError(err.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId]);

  const exportJSON = async () => {
    try {
      const res = await ipc(IpcChannel.EXPORT_ANALYTICS_JSON, { sessionId });
      if (!res.success) {
        if (res.error !== 'Cancelled by user') {
          console.error(res.error);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const exportPDF = async () => {
    try {
      const res = await ipc(IpcChannel.PRINT_ANALYTICS_PDF);
      if (!res.success) {
        if (res.error !== 'Cancelled by user') {
          console.error(res.error);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return { data, loading, error, exportJSON, exportPDF };
}
