export const APP_CONFIG = {
  appName: 'Expense Tracker',
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
  apiTimeoutMs: 15000,
  defaultCurrency: 'USD',
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'] as const,
  storageKeys: {
    authToken: 'expense_tracker_auth_token',
    refreshToken: 'expense_tracker_refresh_token',
    userPreferences: 'expense_tracker_user_prefs',
  },
} as const;
