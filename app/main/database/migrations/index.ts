/**
 * Database migration runner
 * Applies versioned schema migrations in order.
 * Each migration has an up() function.
 * The schema_version table tracks which migrations have been applied.
 */

import type Database from 'better-sqlite3';
import { logger } from '../../logger';

const log = logger.module('Migrations');

interface Migration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
}

const migration3 = `
-- Phase 13: Learning Intelligence Platform
CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id),
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id),
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_question_id ON bookmarks(question_id);
CREATE INDEX IF NOT EXISTS idx_notes_question_id ON notes(question_id);
`;

/**
 * All migrations in order.
 * New migrations must be appended to this array with incrementing version numbers.
 */
const migrations: Migration[] = [
  // 001 and 002 were handled externally or via setup scripts previously.
  // We only include 003 here to run dynamically for Phase 13.
  {
    version: 3,
    name: '003_learning_platform',
    up: (db) => {
      db.exec(migration3);
    }
  }
];

/**
 * Run all pending migrations within a transaction.
 */
export function runMigrations(db: Database.Database): void {
  // Create the migration tracking table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const currentVersion = db
    .prepare('SELECT MAX(version) as version FROM schema_version')
    .get() as { version: number | null };

  const appliedVersion = currentVersion?.version ?? 0;
  const pendingMigrations = migrations.filter((m) => m.version > appliedVersion);

  if (pendingMigrations.length === 0) {
    log.info(`Database is up to date (version ${appliedVersion})`);
    return;
  }

  log.info(
    `Applying ${pendingMigrations.length} migration(s) from version ${appliedVersion}`,
  );

  const applyMigration = db.transaction((migration: Migration) => {
    log.info(`  Applying migration ${migration.version}: ${migration.name}`);
    migration.up(db);

    db.prepare(
      'INSERT INTO schema_version (version, name) VALUES (?, ?)',
    ).run(migration.version, migration.name);
  });

  for (const migration of pendingMigrations) {
    try {
      applyMigration(migration);
    } catch (error) {
      log.error(
        `Migration ${migration.version} (${migration.name}) failed:`,
        error,
      );
      throw error;
    }
  }

  log.info(`All migrations applied. Database now at version ${pendingMigrations[pendingMigrations.length - 1].version}`);
}
