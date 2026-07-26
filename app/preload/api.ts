/**
 * Typed Electron API exposed to the renderer via contextBridge
 */

import type { IpcChannelMap, IpcRequest, IpcResponse } from '../shared/types/ipc.types';

export interface ElectronAPI {
  /**
   * Invoke a typed IPC channel.
   * Type safety is enforced at the call site via the IPC channel map.
   */
  invoke<C extends keyof IpcChannelMap>(
    channel: C,
    ...args: IpcRequest<C> extends void ? [] : [IpcRequest<C>]
  ): Promise<IpcResponse<C>>;

  /**
   * Listen for events from the main process.
   * Returns an unsubscribe function.
   */
  on(channel: string, callback: (...args: unknown[]) => void): () => void;
}

/**
 * Augment the Window interface so TypeScript knows about window.electronAPI
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
