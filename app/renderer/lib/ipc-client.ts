/**
 * Typed IPC client for the renderer process
 * Wraps window.electronAPI.invoke with full type inference
 */

import type { IpcChannelMap } from '@shared/types/ipc.types';
import type { IpcRequest, IpcResponse } from '@shared/types/ipc.types';

/**
 * Type-safe IPC invoke wrapper.
 *
 * Usage:
 *   const tests = await ipc(IpcChannel.GET_ALL_TESTS);
 *   const test = await ipc(IpcChannel.GET_TEST_BY_ID, { testId: '123' });
 */
export async function ipc<C extends keyof IpcChannelMap>(
  channel: C,
  ...args: IpcRequest<C> extends void ? [] : [IpcRequest<C>]
): Promise<IpcResponse<C>> {
  return window.electronAPI.invoke(channel, ...args) as Promise<IpcResponse<C>>;
}

/**
 * Subscribe to a main → renderer event.
 * Returns an unsubscribe function.
 */
export function onMainEvent(
  channel: string,
  callback: (...args: unknown[]) => void,
): () => void {
  return window.electronAPI.on(channel, callback);
}
