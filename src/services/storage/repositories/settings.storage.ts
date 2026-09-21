import { storageService } from '../storage.service';
import { STORAGE_KEYS } from '../storage.keys';
import { UserSettings } from '@/features/settings/types/settings.types';
import { DEFAULT_SETTINGS } from '@/features/settings/constants/settings.constants';

/**
 * Local Settings Storage Repository.
 * Encapsulates persistence logic for user preferences (currency, theme, notifications).
 */
export const settingsStorage = {
  /**
   * Load user settings from storage with fallback to default settings.
   */
  async getSettings(): Promise<UserSettings> {
    try {
      const stored = await storageService.getItem<UserSettings>(STORAGE_KEYS.USER_SETTINGS);
      if (stored && typeof stored === 'object') {
        return stored;
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.warn('[SettingsStorage] Error loading user settings, using defaults:', error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Save user settings to storage.
   */
  async saveSettings(settings: UserSettings): Promise<boolean> {
    try {
      return await storageService.setItem(STORAGE_KEYS.USER_SETTINGS, settings);
    } catch (error) {
      console.error('[SettingsStorage] Error saving user settings:', error);
      return false;
    }
  },

  /**
   * Reset settings back to defaults.
   */
  async resetSettings(): Promise<UserSettings> {
    try {
      await storageService.setItem(STORAGE_KEYS.USER_SETTINGS, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('[SettingsStorage] Error resetting settings:', error);
      return DEFAULT_SETTINGS;
    }
  },
};
