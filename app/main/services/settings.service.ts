/**
 * SettingsService interface
 * Business logic wrapper around settings repository
 */

import type { AppSettings } from '../../shared/types/settings.types';

export interface SettingsService {
  /**
   * Gets current settings, populating defaults if missing
   */
  getSettings(): Promise<AppSettings>;

  /**
   * Updates settings and triggers any required side effects
   * @param updates Partial settings object
   */
  updateSettings(updates: Partial<AppSettings>): Promise<AppSettings>;

  /**
   * Resets settings to factory defaults
   */
  resetSettings(): Promise<AppSettings>;
}
