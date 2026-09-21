import { CurrencyOption, UserSettings } from '../types/settings.types';

export const SETTINGS_STORAGE_KEY = 'expense_tracker_settings_preferences';

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
];

export const APP_INFO = {
  name: 'Expense Tracker',
  version: '1.0.0',
  build: '101',
  releaseDate: 'September 2026',
  supportEmail: 'support@expensetracker.app',
};

export const DEFAULT_SETTINGS: UserSettings = {
  profile: {
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
  },
  currency: SUPPORTED_CURRENCIES[0], // INR
  theme: 'system',
  notifications: {
    dailyReminder: true,
    budgetAlerts: true,
    monthlySummary: true,
    weeklyReport: false,
    dailyReminderTime: '20:00',
    budgetWarningThreshold: 80,
  },
  security: {
    biometricEnabled: false,
  },
};

export const PRIVACY_POLICY_SECTIONS = [
  {
    title: '1. Data Storage & Privacy',
    content:
      'Expense Tracker operates with a privacy-first approach. All your financial records, expense logs, budget caps, and personal configurations are stored locally on your device storage. We do not sell, monetize, or track your personal financial transactions.',
  },
  {
    title: '2. Local Device Storage',
    content:
      'Your preferences and transaction history are encrypted and retained locally using SecureStore and AsyncStorage on your mobile device. You have full control over deleting or exporting your financial records at any time.',
  },
  {
    title: '3. Security & Biometrics',
    content:
      'When biometric authentication is enabled, verification is handled exclusively by your hardware device (Face ID or fingerprint sensor) through native operating system APIs. Biometric data is never transmitted or stored by this application.',
  },
  {
    title: '4. Contact & Support',
    content:
      'If you have questions about our data practices or wish to request data removal, contact our privacy officer at privacy@expensetracker.app.',
  },
];

export const TERMS_OF_SERVICE_SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content:
      'By using Expense Tracker, you agree to these Terms of Service. If you disagree with any portion of these terms, please discontinue using the application.',
  },
  {
    title: '2. Personal Financial Management',
    content:
      'Expense Tracker is provided as a personal budgeting and expense tracking utility. It is not intended to provide legal, certified accounting, or certified financial advisory advice. You are responsible for verifying your own financial transactions.',
  },
  {
    title: '3. Data Responsibility',
    content:
      'Because financial records are stored on your local device, you are responsible for maintaining device security and standard operating system backups.',
  },
  {
    title: '4. Limitation of Liability',
    content:
      'Under no circumstances shall Expense Tracker or its developers be held liable for any indirect, incidental, or consequential damages resulting from the use or inability to use this software.',
  },
];
