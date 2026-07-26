import { ipcMain } from 'electron';
import { IpcChannel } from '../../shared/types/ipc.types';
import type { AppSettings } from '../../shared/types/settings.types';
import { logger } from '../logger';
import { getDatabase } from '../database/connection';
import { SettingsRepositoryImpl } from '../database/repositories/settings.repository.impl';
import { SettingsServiceImpl } from '../services/settings.service.impl';

const log = logger.module('IPC:Settings');

export function registerSettingsHandlers(): void {
  // Lazy initialize to ensure DB is connected when called
  const getSettingsService = () => {
    const db = getDatabase();
    const repo = new SettingsRepositoryImpl(db);
    return new SettingsServiceImpl(repo);
  };

  ipcMain.handle(IpcChannel.GET_SETTINGS, async () => {
    log.debug('GET_SETTINGS called');
    return getSettingsService().getSettings();
  });

  ipcMain.handle(IpcChannel.UPDATE_SETTINGS, async (_event, updates: Partial<AppSettings>) => {
    log.info('UPDATE_SETTINGS called', updates);
    return getSettingsService().updateSettings(updates);
  });

  ipcMain.handle(IpcChannel.RESET_SETTINGS, async () => {
    log.info('RESET_SETTINGS called');
    return getSettingsService().resetSettings();
  });

  log.info('Settings handlers registered');
}
