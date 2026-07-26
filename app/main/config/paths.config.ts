/**
 * Application paths configuration
 * All filesystem paths are resolved relative to Electron's userData directory
 */

import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { APP_CONFIG } from './app.config';

let _paths: AppPaths | null = null;

export interface AppPaths {
  /** Root data directory (Electron userData) */
  data: string;
  /** SQLite database file path */
  database: string;
  /** Images storage directory */
  images: string;
  /** Backup storage directory */
  backups: string;
  /** Temporary extraction directory */
  temp: string;
}

/**
 * Get application paths, creating directories if they don't exist.
 * Must be called after app.whenReady().
 */
export function getAppPaths(): AppPaths {
  if (_paths) return _paths;

  const dataDir = app.getPath('userData');

  _paths = {
    data: dataDir,
    database: path.join(dataDir, APP_CONFIG.databaseFile),
    images: path.join(dataDir, APP_CONFIG.imageSubdir),
    backups: path.join(dataDir, APP_CONFIG.backupSubdir),
    temp: path.join(dataDir, APP_CONFIG.tempSubdir),
  };

  // Ensure directories exist
  for (const dir of [_paths.images, _paths.backups, _paths.temp]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  return _paths;
}

/**
 * Get the image storage path for a specific test
 */
export function getTestImageDir(testId: string): string {
  const paths = getAppPaths();
  const dir = path.join(paths.images, testId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Get a temporary directory for extraction
 */
export function getTempDir(operationId: string): string {
  const paths = getAppPaths();
  const dir = path.join(paths.temp, operationId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}
