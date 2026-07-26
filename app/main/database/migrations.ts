import type { Database } from 'better-sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';
import { logger } from '../logger';

const log = logger.module('Migrations');

export function runMigrations(db: Database): void {
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const currentVersion = (db.prepare('SELECT MAX(version) as version FROM schema_migrations').get() as { version: number | null })?.version || 0;

  // For development, it's <project_root>/src/main/database/migrations
  // For production, we would need to ensure the migrations folder is copied (e.g. to resourcesPath)
  let migrationsDir = app.isPackaged 
    ? join(process.resourcesPath, 'migrations') 
    : join(app.getAppPath(), 'src', 'main', 'database', 'migrations');

  let files: string[] = [];
  try {
    files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  } catch (error) {
    log.error('Failed to read migrations directory:', error);
    return;
  }

  const pendingMigrations = files.filter(file => {
    const versionMatch = file.match(/^(\d+)_/);
    if (!versionMatch) return false;
    const version = parseInt(versionMatch[1], 10);
    return version > currentVersion;
  });

  if (pendingMigrations.length === 0) {
    log.info('No pending migrations.');
    return;
  }

  log.info(`Found ${pendingMigrations.length} pending migrations.`);

  const applyMigration = db.transaction((file: string, version: number) => {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf-8');
    db.exec(sql);
    db.prepare('INSERT INTO schema_migrations (version, name) VALUES (?, ?)').run(version, file);
  });

  for (const file of pendingMigrations) {
    const versionMatch = file.match(/^(\d+)_/);
    if (versionMatch) {
      const version = parseInt(versionMatch[1], 10);
      log.info(`Applying migration: ${file}`);
      try {
        applyMigration(file, version);
        log.info(`Migration ${file} applied successfully.`);
      } catch (err) {
        log.error(`Failed to apply migration ${file}:`, err);
        throw err; // Stop applying if one fails
      }
    }
  }
}
