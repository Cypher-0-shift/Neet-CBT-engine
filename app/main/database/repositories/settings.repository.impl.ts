import type { Database } from 'better-sqlite3';
import type { SettingsRepository } from './settings.repository';
import type { AppSettings } from '../../../shared/types/settings.types';

export class SettingsRepositoryImpl implements SettingsRepository {
  constructor(private db: Database) {}

  async getSettings(): Promise<AppSettings> {
    const rows = this.db.prepare('SELECT key, value_json FROM settings').all() as { key: string; value_json: string }[];
    const settings: Partial<AppSettings> = {};
    for (const row of rows) {
      settings[row.key as keyof AppSettings] = JSON.parse(row.value_json);
    }
    return settings as AppSettings;
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const updateStmt = this.db.prepare(
      'INSERT INTO settings (key, value_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP'
    );
    
    const applyUpdate = this.db.transaction((settingsUpdates: Partial<AppSettings>) => {
      for (const [key, value] of Object.entries(settingsUpdates)) {
        updateStmt.run(key, JSON.stringify(value));
      }
    });

    applyUpdate(updates);
    return this.getSettings();
  }

  async resetSettings(): Promise<AppSettings> {
    this.db.prepare('DELETE FROM settings').run();
    return {} as AppSettings; // Service layer should provide defaults
  }
}
