/**
 * useIpc — React hook for typed IPC calls with loading/error states
 */

import { useState, useCallback, useEffect } from 'react';
import type { IpcChannelMap } from '@shared/types/ipc.types';
import type { IpcRequest, IpcResponse } from '@shared/types/ipc.types';
import { ipc } from '../lib/ipc-client';

interface UseIpcState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseIpcResult<C extends keyof IpcChannelMap> extends UseIpcState<IpcResponse<C>> {
  execute: (
    ...args: IpcRequest<C> extends void ? [] : [IpcRequest<C>]
  ) => Promise<IpcResponse<C>>;
  reset: () => void;
}

/**
 * Hook for making typed IPC calls.
 *
 * Usage:
 *   const { data, isLoading, error, execute } = useIpc(IpcChannel.GET_ALL_TESTS);
 *
 *   useEffect(() => { execute(); }, []);
 */
export function useIpc<C extends keyof IpcChannelMap>(channel: C): UseIpcResult<C> {
  const [state, setState] = useState<UseIpcState<IpcResponse<C>>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (
      ...args: IpcRequest<C> extends void ? [] : [IpcRequest<C>]
    ): Promise<IpcResponse<C>> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await ipc(channel, ...args);
        setState({ data: result, isLoading: false, error: null });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
        throw err;
      }
    },
    [channel],
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

/**
 * Hook that auto-executes an IPC call on mount (for parameterless channels)
 */
export function useIpcQuery<C extends keyof IpcChannelMap>(
  channel: C,
  ...args: IpcRequest<C> extends void ? [] : [IpcRequest<C>]
): UseIpcState<IpcResponse<C>> & { refetch: () => void } {
  const { data, isLoading, error, execute } = useIpc(channel);

  const refetch = useCallback(() => {
    execute(...args);
  }, [execute, ...args]);

  useEffect(() => {
    refetch();
  }, []);

  return { data, isLoading, error, refetch };
}
