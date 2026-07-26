import type { SettingsService } from './settings.service';
import type { SettingsRepository } from '../database/repositories/settings.repository';
import { type AppSettings, DEFAULT_SETTINGS } from '../../shared/types/settings.types';

export class SettingsServiceImpl implements SettingsService {
  constructor(private settingsRepo: SettingsRepository) {}

  async getSettings(): Promise<AppSettings> {
    const userSettings = await this.settingsRepo.getSettings();
    return this.mergeWithDefaults(userSettings);
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const merged = { ...current, ...updates }; 
    await this.settingsRepo.updateSettings(updates);
    return merged;
  }

  async resetSettings(): Promise<AppSettings> {
    await this.settingsRepo.resetSettings();
    return DEFAULT_SETTINGS;
  }

  private mergeWithDefaults(userSettings: Partial<AppSettings>): AppSettings {
    return {
      ...DEFAULT_SETTINGS,
      ...userSettings
    };
  }
}
