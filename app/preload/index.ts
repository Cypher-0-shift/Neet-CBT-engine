/**
 * Preload script
 * Bridges the main process and renderer using contextBridge.
 * Only exposes a minimal, typed API surface — no Node.js access in renderer.
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from './api';

const api: ElectronAPI = {
  invoke: ((channel: string, ...args: unknown[]): Promise<any> => {
    return ipcRenderer.invoke(channel, ...args);
  }) as any,

  on: (channel: string, callback: (...args: unknown[]) => void): (() => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => {
      callback(...args);
    };
    ipcRenderer.on(channel, subscription);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
