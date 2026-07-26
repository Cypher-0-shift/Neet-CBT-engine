/**
 * System IPC handlers
 * Handles file dialogs, fullscreen, and app info
 */

import { ipcMain, dialog, BrowserWindow, app } from 'electron';
import { IpcChannel } from '../../shared/types/ipc.types';
import { APP_CONFIG } from '../config/app.config';
import { getAppPaths } from '../config/paths.config';
import { logger } from '../logger';
import { BackupServiceImpl } from '../services/backup.service.impl';
import type { IpcRequest } from '../../shared/types/ipc.types';

const log = logger.module('IPC:System');

export function registerSystemHandlers(): void {
  // Open file dialog
  ipcMain.handle(IpcChannel.OPEN_FILE_DIALOG, async (_event, args) => {
    const filters = args?.filters ?? [
      { name: 'ZIP Archives', extensions: ['zip'] },
    ];

    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters,
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    log.info(`File selected: ${result.filePaths[0]}`);
    return result.filePaths[0];
  });

  // Toggle fullscreen
  ipcMain.handle(IpcChannel.TOGGLE_FULLSCREEN, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      const newState = !window.isFullScreen();
      window.setFullScreen(newState);
      log.info(`Fullscreen toggled: ${newState}`);
      return newState;
    }
    return false;
  });

  // Get fullscreen state
  ipcMain.handle(IpcChannel.GET_FULLSCREEN_STATE, (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return window?.isFullScreen() ?? false;
  });

  // Get app version
  ipcMain.handle(IpcChannel.GET_APP_VERSION, () => {
    return APP_CONFIG.version;
  });

  // Get app paths
  ipcMain.handle(IpcChannel.GET_APP_PATHS, () => {
    const paths = getAppPaths();
    return {
      data: paths.data,
      images: paths.images,
      backups: paths.backups,
      database: paths.database,
    };
  });

  // App Lifecycle
  ipcMain.handle(IpcChannel.QUIT_APP, () => {
    app.quit();
  });

  ipcMain.handle(IpcChannel.RESTART_APP, () => {
    app.relaunch();
    app.exit(0);
  });

  // Backup & Restore
  const backupService = new BackupServiceImpl();

  ipcMain.handle(IpcChannel.CREATE_BACKUP, async (_, req: IpcRequest<typeof IpcChannel.CREATE_BACKUP>) => {
    try {
      // Let user choose directory if none provided, but we require it in args for now.
      // If we wanted to prompt, we'd use dialog.showSaveDialog here.
      let destDir = req.destinationDir;
      if (!destDir) {
         const paths = getAppPaths();
         destDir = paths.backups;
      }
      const p = await backupService.createBackup(destDir);
      return { success: true, path: p };
    } catch (e: any) {
      log.error('Backup IPC error:', e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle(IpcChannel.RESTORE_BACKUP, async (_, req: IpcRequest<typeof IpcChannel.RESTORE_BACKUP>) => {
    try {
      await backupService.restoreBackup(req.sourcePath);
      // We must restart after a restore because connections and DB files are swapped
      app.relaunch();
      app.exit(0);
      return { success: true };
    } catch (e: any) {
      log.error('Restore IPC error:', e);
      return { success: false, error: e.message };
    }
  });

  log.info('System handlers registered');
}
