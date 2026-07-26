/**
 * IPC Handler Registry
 * Registers all IPC handlers for the main process.
 * Each handler module is responsible for a specific domain.
 */

import { registerSystemHandlers } from './system.ipc';
import { registerDatabaseHandlers } from './database.ipc';
import { registerSettingsHandlers } from './settings.ipc';
import { registerImportHandlers } from './import.ipc';
import { registerSessionHandlers } from './session.ipc';
import { registerAnalyticsHandlers } from './analytics.ipc';
import { registerIntelligenceHandlers } from './intelligence.ipc';
import { registerEventHandlers } from './events.ipc';
import { logger } from '../logger';

const log = logger.module('IPC');

/**
 * Register all IPC handlers.
 * Call this once during app initialization after database is ready.
 */
export function registerIpcHandlers(): void {
  log.info('Registering IPC handlers...');

  registerSystemHandlers();
  registerDatabaseHandlers();
  registerSettingsHandlers();
  registerImportHandlers();
  registerSessionHandlers();
  registerAnalyticsHandlers();
  registerIntelligenceHandlers();
  registerEventHandlers();

  // Future phases will add:

  log.info('All IPC handlers registered');
}
