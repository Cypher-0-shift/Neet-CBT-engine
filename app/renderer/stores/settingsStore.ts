/**
 * Settings store
 * Syncs with the main process settings via IPC
 */

import { create } from 'zustand';
import type { AppSettings } from '@shared/types/settings.types';
import { DEFAULT_SETTINGS } from '@shared/types/settings.types';
import { ipc } from '../lib/ipc-client';
import { IpcChannel } from '@shared/types/ipc.types';

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: { ...DEFAULT_SETTINGS },
  isLoaded: false,

  loadSettings: async () => {
    try {
      const settings = await ipc(IpcChannel.GET_SETTINGS);
      set({ settings, isLoaded: true });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoaded: true }); // Use defaults
    }
  },

  updateSettings: async (updates) => {
    try {
      const settings = await ipc(IpcChannel.UPDATE_SETTINGS, updates);
      set({ settings });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  },

  resetSettings: async () => {
    try {
      const settings = await ipc(IpcChannel.RESET_SETTINGS);
      set({ settings });
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  },
}));
