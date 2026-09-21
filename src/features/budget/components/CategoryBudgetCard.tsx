import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Budget } from '../types/budget.types';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { BudgetProgress } from './BudgetProgress';
import { spacing, radius } from '@/constants';
import { formatExpenseAmount } from '@/features/expenses/utils/expense.utils';
import { useAppTheme } from '@/hooks';

export interface CategoryBudgetCardProps {
  budget: Budget;
  spentAmount: number;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  currency?: string;
}

export const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({
  budget,
  spentAmount,
  onEdit,
  onDelete,
  currency = 'INR',
}) => {
  const { colors } = useAppTheme();

  return (
    <AppCard variant="outlined" style={styles.card}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.categoryLeft}>
          <CategoryIcon
            category={budget.categoryName || 'Other'}
            iconName={budget.categoryIcon}
            color={budget.categoryColor}
            backgroundColor={budget.categoryBg}
            size="md"
          />
          <View style={styles.nameCol}>
            <AppText variant="bodyMdMedium" color={colors.textPrimary} weight="600" numberOfLines={1}>
              {budget.categoryName}
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Limit: {formatExpenseAmount(budget.amount, { currency })}
            </AppText>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => onEdit(budget)}
            style={styles.actionBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Edit budget for ${budget.categoryName}`}
          >
            <AppIcon name="pencil-outline" size={18} color={colors.primary} />
          </Pressable>

          <Pressable
            onPress={() => onDelete(budget)}
            style={styles.actionBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Delete budget for ${budget.categoryName}`}
          >
            <AppIcon name="trash-can-outline" size={18} color={colors.danger} />
          </Pressable>
        </View>
      </View>

      {/* Progress Component */}
      <BudgetProgress
        budgetAmount={budget.amount}
        spentAmount={spentAmount}
        currency={currency}
        height={7}
      />
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm + 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  nameCol: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});
