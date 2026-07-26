/**
 * SettingsRepository interface
 * Handles persistence of user preferences
 */

import type { AppSettings } from '../../../shared/types/settings.types';

export interface SettingsRepository {
  /**
   * Retrieve all settings
   */
  getSettings(): Promise<AppSettings>;

  /**
   * Update specific settings
   * @param updates Partial settings object
   */
  updateSettings(updates: Partial<AppSettings>): Promise<AppSettings>;

  /**
   * Reset all settings to defaults
   */
  resetSettings(): Promise<AppSettings>;
}
