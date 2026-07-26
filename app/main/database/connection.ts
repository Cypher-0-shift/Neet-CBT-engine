/**
 * SQLite database connection
 * Initializes better-sqlite3 with WAL mode and performance pragmas
 */

import Database from 'better-sqlite3';
import { getAppPaths } from '../config/paths.config';
import { MAIN_CONSTANTS } from '../config/constants';
import { logger } from '../logger';
import { runMigrations } from './migrations';

const log = logger.module('Database');

let _db: Database.Database | null = null;

/**
 * Initialize the SQLite database connection.
 * Creates the database file if it doesn't exist.
 * Applies all pending migrations.
 */
export function initializeDatabase(): Database.Database {
  if (_db) return _db;

  const paths = getAppPaths();
  log.info(`Initializing database at: ${paths.database}`);

  try {
    _db = new Database(paths.database);

    // Apply performance pragmas
    const pragmas = MAIN_CONSTANTS.DB_PRAGMAS;
    for (const [key, value] of Object.entries(pragmas)) {
      _db.pragma(`${key} = ${value}`);
    }

    // Set a busy timeout to handle concurrent locks gracefully
    _db.pragma('busy_timeout = 5000');

    log.info('Database pragmas applied:', pragmas);

    // Run migrations
    runMigrations(_db);

    log.info('Database initialized successfully');
    return _db;
  } catch (error) {
    log.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get the active database connection.
 * Throws if database hasn't been initialized.
 */
export function getDatabase(): Database.Database {
  if (!_db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return _db;
}

/**
 * Run database optimization (VACUUM and ANALYZE)
 * Should be called periodically or on shutdown
 */
export function optimizeDatabase(): void {
  if (!_db) return;
  try {
    log.info('Running database optimization (PRAGMA optimize)...');
    _db.pragma('optimize');
    log.info('Database optimization complete');
  } catch (error) {
    log.error('Database optimization failed:', error);
  }
}

/**
 * Close the database connection gracefully.
 */
export function closeDatabase(): void {
  if (_db) {
    log.info('Closing database connection');
    optimizeDatabase();
    _db.close();
    _db = null;
  }
}
