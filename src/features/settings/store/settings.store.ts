import { create } from 'zustand';
import {
  UserSettings,
  CurrencyOption,
  ThemePreference,
  NotificationPreferences,
} from '../types/settings.types';
import { DEFAULT_SETTINGS } from '../constants/settings.constants';
import { settingsStorage } from '@/services/storage';
import { useAuthStore } from '@/store/auth.store';

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
  setCurrency: (currency: CurrencyOption) => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  toggleNotification: (key: keyof NotificationPreferences) => Promise<void>;
  setDailyReminderTime: (time: string) => Promise<void>;
  setBudgetWarningThreshold: (threshold: number) => Promise<void>;
  toggleBiometric: (enabled: boolean) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const stored = await settingsStorage.getSettings();
      if (stored) {
        // If profile was default but an authenticated user exists, sync name/email
        const authUser = useAuthStore.getState().user;
        const initial = {
          ...stored,
          ...(authUser && stored.profile.email === DEFAULT_SETTINGS.profile.email && {
            profile: {
              name: authUser.name,
              email: authUser.email,
            },
          }),
        };
        set({ settings: initial, isLoading: false });
      } else {
        set({ settings: DEFAULT_SETTINGS, isLoading: false });
      }
    } catch (err) {
      console.warn('[SettingsStore] Failed to load settings, using defaults:', err);
      set({ settings: DEFAULT_SETTINGS, isLoading: false });
    }
  },

  updateProfile: async (name: string, email: string) => {
    const updated: UserSettings = {
      ...get().settings,
      profile: {
        ...get().settings.profile,
        name: name.trim(),
        email: email.trim(),
      },
    };

    set({ settings: updated });
    await settingsStorage.saveSettings(updated).catch((err) => {
      console.warn('[SettingsStore] Failed to persist profile updates:', err);
    });
  },

  setCurrency: async (currency: CurrencyOption) => {
    const updated: UserSettings = {
      ...get().settings,
      currency,
    };
    set({ settings: updated });
    await settingsStorage.saveSettings(updated).catch((err) => {
      console.warn('[SettingsStore] Failed to persist currency change:', err);
    });
  },

  setTheme: async (theme: ThemePreference) => {
    const updated: UserSettings = {
      ...get().settings,
      theme,
    };
    set({ settings: updated });
    await settingsStorage.saveSettings(updated).catch((err) => {
      console.warn('[SettingsStore] Failed to persist theme change:', err);
    });
  },

  toggleNotification: async (key: keyof NotificationPreferences) => {
    const current = get().settings.notifications[key];
    const newValue = !current;
    const updated: UserSettings = {
      ...get().settings,
      notifications: {
        ...get().settings.notifications,
        [key]: newValue,
      },
    };
    set({ settings: updated });
    await settingsStorage.saveSettings(updated).catch((err) => {
      console.warn('[SettingsStore] Failed to persist notification changes:', err);
    });

    // Synchronize scheduled notifications
    if (key === 'dailyReminder') {
      const { notificationService } = await import('@/services/notifications');
      if (newValue) {
        const timeStr = updated.notifications.dailyReminderTime || '20:00';
        const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
        await notificationService.scheduleDailyReminder({ hour: h, minute: m });
      } else {
        await notificationService.cancelDailyReminder();
      }
    }
  },

  setDailyReminderTime: async (time: string) => {
    const updated: UserSettings = {
      ...get().settings,
      notifications: {
        ...get().settings.notifications,
        dailyReminderTime: time,
      },
    };
    set({ settings: updated });
    await settingsStorage.saveSettings(updated).catch((err) => {
      console.warn('[SettingsStore] Failed to persist reminder time:', err);
    });

    if (updated.notifications.dailyReminder) {
      const { notificationService } = await import('@/services/notifications');
      const [h, m] = time.split(':').map((v) => parseInt(v, 10) || 0);
      await notificationService.scheduleDailyReminder({ hour: h, minute: m });
    }
  },

  setBudgetWarningThreshold: async (threshold: number) => {
    const updated: UserSettings = {
      ...get().settings,
      notifications: {
        ...get().settings.notifications,
        budgetWarningThreshold: threshold,
      },
    };
    set({ settings: updated });
    await settingsStorage.saveSettings(updated).catch((err) => {
      console.warn('[SettingsStore] Failed to persist budget threshold:', err);
    });
  },

  toggleBiometric: async (enabled: boolean) => {
    const updated: UserSettings = {
      ...get().settings,
      security: {
        ...get().settings.security,
        biometricEnabled: enabled,
      },
    };
    set({ settings: updated });
    await settingsStorage.saveSettings(updated).catch((err) => {
      console.warn('[SettingsStore] Failed to persist biometric preference:', err);
    });
  },

  resetSettings: async () => {
    const defaults = await settingsStorage.resetSettings();
    set({ settings: defaults });
  },
}));
