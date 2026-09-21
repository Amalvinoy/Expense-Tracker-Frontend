export type BudgetWarningTier = 'safe' | 'moderate' | 'caution' | 'exceeded';

export type BudgetType = 'total' | 'category';

export interface Budget {
  id: string;
  type: BudgetType;
  amount: number;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  categoryBg?: string;
  month: string; // YYYY-MM
  createdAt: string;
  updatedAt: string;
}

export interface BudgetProgressInfo {
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  tier: BudgetWarningTier;
  tierLabel: string;
  isOverBudget: boolean;
}

export interface BudgetTierVisualConfig {
  label: string;
  color: string;
  backgroundColor: string;
  trackColor: string;
  icon: string;
  description: string;
}

export interface CreateBudgetPayload {
  type: BudgetType;
  amount: number;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  categoryBg?: string;
  month?: string;
}

export interface UpdateBudgetPayload {
  amount: number;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  categoryBg?: string;
}
