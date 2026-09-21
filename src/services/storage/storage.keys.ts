/**
 * Storage Keys Configuration
 * Centralized registry for all AsyncStorage and SecureStore key definitions.
 * Namespaced with versioning to prevent collisions and support migrations.
 */

export const STORAGE_KEYS = {
  // Application Data (AsyncStorage)
  EXPENSES: 'expense_tracker_expenses_list_v1',
  CATEGORIES: 'expense_tracker_categories_list_v1',
  MONTHLY_TOTAL_BUDGET: 'expense_tracker_monthly_total_budget_v1',
  CATEGORY_BUDGETS: 'expense_tracker_budgets_list_v1',
  USER_SETTINGS: '@expense_tracker_user_settings_v1',
  USER_PREFERENCES: 'expense_tracker_user_prefs_v1',
  NOTIFICATIONS: 'expense_tracker_notifications_list_v1',
  NOTIFICATION_DISPATCH_LOG: 'expense_tracker_notification_dispatch_log_v1',
  
  // Legacy keys support for seamless backward compatibility
  LEGACY_EXPENSES: 'expense_tracker_expenses_list',
  LEGACY_CATEGORIES: 'expense_tracker_categories_list',
  LEGACY_MONTHLY_TOTAL_BUDGET: 'expense_tracker_monthly_total_budget',
  LEGACY_CATEGORY_BUDGETS: 'expense_tracker_budgets_list',
} as const;

export const SECURE_KEYS = {
  // Sensitive Authentication Data (SecureStore only)
  AUTH_TOKEN: 'expense_tracker_auth_token',
  REFRESH_TOKEN: 'expense_tracker_refresh_token',
  AUTH_SESSION: 'expense_tracker_auth_session',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type SecureStorageKey = typeof SECURE_KEYS[keyof typeof SECURE_KEYS];
