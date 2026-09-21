import { Budget, BudgetWarningTier, BudgetTierVisualConfig } from '../types/budget.types';

export const BUDGET_STORAGE_KEY = 'expense_tracker_budgets_list';
export const TOTAL_BUDGET_STORAGE_KEY = 'expense_tracker_monthly_total_budget';

export const DEFAULT_MONTHLY_TOTAL_BUDGET = 0;

export const INITIAL_CATEGORY_BUDGETS: Budget[] = [];

export const BUDGET_TIER_CONFIGS: Record<BudgetWarningTier, BudgetTierVisualConfig> = {
  safe: {
    label: 'On Track',
    color: '#10B981', // Emerald
    backgroundColor: '#ECFDF5',
    trackColor: '#D1FAE5',
    icon: 'check-circle-outline',
    description: 'Spending is below 50% of allocated budget.',
  },
  moderate: {
    label: 'Moderate',
    color: '#2563EB', // Slate Blue
    backgroundColor: '#EFF6FF',
    trackColor: '#DBEAFE',
    icon: 'information-outline',
    description: 'Spending is between 50% and 80% of budget.',
  },
  caution: {
    label: 'Caution',
    color: '#D97706', // Golden Amber
    backgroundColor: '#FFFBEB',
    trackColor: '#FDE68A',
    icon: 'alert-outline',
    description: 'Spending is between 80% and 100% of budget.',
  },
  exceeded: {
    label: 'Over Budget',
    color: '#E11D48', // Soft Crimson Rose
    backgroundColor: '#FFF1F2',
    trackColor: '#FECDD3',
    icon: 'alert-circle-outline',
    description: 'Spending has exceeded 100% of allocated limit.',
  },
};
