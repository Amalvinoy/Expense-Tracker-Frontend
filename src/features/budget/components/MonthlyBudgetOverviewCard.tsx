import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AmountText } from '@/components/common/AmountText';
import { AppIcon } from '@/components/common/AppIcon';
import { BudgetProgress } from './BudgetProgress';
import { calculateBudgetProgress } from '../utils/budget.utils';
import { spacing, radius } from '@/constants';
import { useAppTheme } from '@/hooks';

export interface MonthlyBudgetOverviewCardProps {
  totalBudget: number;
  totalSpent: number;
  onEditTotalBudget: () => void;
  onDeleteTotalBudget?: () => void;
  currency?: string;
}

export const MonthlyBudgetOverviewCard: React.FC<MonthlyBudgetOverviewCardProps> = ({
  totalBudget,
  totalSpent,
  onEditTotalBudget,
  onDeleteTotalBudget,
  currency = 'INR',
}) => {
  const { colors } = useAppTheme();
  const progress = calculateBudgetProgress(totalBudget, totalSpent);

  return (
    <AppCard variant="elevated" style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <AppText variant="caption" color={colors.textSecondary} weight="600">
            MONTHLY BUDGET
          </AppText>
          <AmountText
            amount={totalBudget}
            currency={currency}
            variant="headingXl"
            type="neutral"
            showSign={false}
          />
        </View>

        <View style={styles.headerActionsRow}>
          <Pressable
            onPress={onEditTotalBudget}
            style={[styles.editButton, { backgroundColor: colors.primarySoft }]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit monthly budget"
          >
            <AppIcon name="pencil-outline" size={16} color={colors.primary} />
            <AppText variant="caption" color={colors.primary} weight="600" style={{ marginLeft: 4 }}>
              Edit
            </AppText>
          </Pressable>

          {onDeleteTotalBudget && totalBudget > 0 && (
            <Pressable
              onPress={onDeleteTotalBudget}
              style={[styles.deleteButton, { backgroundColor: colors.dangerSoft }]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Remove monthly budget"
            >
              <AppIcon name="trash-can-outline" size={16} color={colors.danger} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Numerical Metrics Summary: Spent & Remaining */}
      <View style={[styles.metricsRow, { backgroundColor: colors.surfaceVariant }]}>
        <View style={styles.metricBox}>
          <AppText variant="caption" color={colors.textSecondary}>
            Spent
          </AppText>
          <AmountText
            amount={totalSpent}
            currency={currency}
            variant="headingSm"
            color={colors.textPrimary}
            showSign={false}
          />
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.divider }]} />

        <View style={styles.metricBox}>
          <AppText variant="caption" color={colors.textSecondary}>
            Remaining
          </AppText>
          <AmountText
            amount={progress.remainingAmount}
            currency={currency}
            variant="headingSm"
            color={progress.isOverBudget ? colors.danger : colors.income}
            showSign={false}
          />
        </View>
      </View>

      {/* Visual Budget Progress Bar */}
      <View style={styles.progressContainer}>
        <BudgetProgress
          budgetAmount={totalBudget}
          spentAmount={totalSpent}
          showDetails={false}
          currency={currency}
        />
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  deleteButton: {
    padding: 7,
    borderRadius: radius.full,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  metricBox: {
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 32,
    marginHorizontal: spacing.sm,
  },
  progressContainer: {
    marginTop: spacing.xxs,
  },
});
