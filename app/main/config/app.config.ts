/**
 * Application configuration
 */

export const APP_CONFIG = {
  name: 'NEET CBT Practice',
  version: '1.0.0',
  description: 'Offline exam simulation and performance intelligence system',

  /** Database filename */
  databaseFile: 'neet-cbt.db',

  /** Minimum window dimensions */
  window: {
    minWidth: 1024,
    minHeight: 700,
    defaultWidth: 1280,
    defaultHeight: 800,
  },

  /** Auto-save and checkpoint intervals */
  intervals: {
    autoSaveMs: 30_000,
    eventFlushMs: 5_000,
    checkpointMs: 30_000,
  },

  /** Image storage subdirectory */
  imageSubdir: 'images',

  /** Backup storage subdirectory */
  backupSubdir: 'backups',

  /** Temporary extraction directory */
  tempSubdir: 'temp',
} as const;
