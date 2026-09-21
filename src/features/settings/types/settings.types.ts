export type ThemePreference = 'system' | 'light' | 'dark';

export interface CurrencyOption {
  code: string; // e.g. 'INR', 'USD'
  symbol: string; // e.g. '₹', '$'
  name: string; // e.g. 'Indian Rupee'
  locale: string; // e.g. 'en-IN'
}

export interface NotificationPreferences {
  dailyReminder: boolean;
  budgetAlerts: boolean; // budget warnings
  monthlySummary: boolean; // monthly spending summary
  weeklyReport?: boolean; // backwards compatibility
  dailyReminderTime?: string; // "HH:mm" e.g. "20:00"
  budgetWarningThreshold?: number; // percentage e.g. 80
}

export interface SecurityPreferences {
  biometricEnabled: boolean;
}

export interface UserProfileSettings {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface UserSettings {
  profile: UserProfileSettings;
  currency: CurrencyOption;
  theme: ThemePreference;
  notifications: NotificationPreferences;
  security: SecurityPreferences;
}
