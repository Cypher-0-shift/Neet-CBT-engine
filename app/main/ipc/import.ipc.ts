import { ipcMain, dialog } from 'electron';
import { IpcChannel } from '../../shared/types/ipc.types';
import type { ImportStep } from '../../shared/types/test.types';
import { logger } from '../logger';
import { getDatabase } from '../database/connection';

import { ZipExtractorServiceImpl } from '../services/zip-extractor.service.impl';
import { JsonValidatorServiceImpl } from '../services/json-validator.service.impl';
import { ImageLoaderServiceImpl } from '../services/image-loader.service.impl';
import { TestRepositoryImpl } from '../database/repositories/test.repository.impl';

import { ImportServiceImpl } from '../services/import.service.impl';

const log = logger.module('IPC:Import');

export function registerImportHandlers(): void {
  ipcMain.handle(IpcChannel.SELECT_IMPORT_PACKAGE, async () => {
    log.info('SELECT_IMPORT_PACKAGE called');
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select NEET Test Package',
      filters: [{ name: 'Test Packages', extensions: ['zip'] }],
      properties: ['openFile']
    });

    if (canceled || filePaths.length === 0) {
      return null;
    }
    
    return filePaths[0];
  });

  ipcMain.handle(IpcChannel.IMPORT_TEST_PACKAGE, async (event, { filePath }) => {
    log.info(`IMPORT_TEST_PACKAGE called with ${filePath}`);
    
    if (typeof filePath !== 'string' || !filePath.endsWith('.zip')) {
      log.error('Invalid filePath provided for import');
      return { success: false, testId: '', message: 'Invalid file path provided. Must be a .zip file.', errors: [] };
    }

    const db = getDatabase();
    
    const importService = new ImportServiceImpl(
      new ZipExtractorServiceImpl(),
      new JsonValidatorServiceImpl(),
      new ImageLoaderServiceImpl(),
      new TestRepositoryImpl(db),
      db
    );

    const onProgress = (step: ImportStep, label: string, progress: number, detail?: string) => {
      // Send progress event to renderer — detail carries granular file-count messages
      event.sender.send(IpcChannel.IMPORT_PROGRESS, { step, label, progress, detail: detail ?? null });
    };

    return importService.importTestPackage(filePath, onProgress);
  });

  log.info('Import handlers registered');
}
