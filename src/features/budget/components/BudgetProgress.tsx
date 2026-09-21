import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { calculateBudgetProgress } from '../utils/budget.utils';
import { BUDGET_TIER_CONFIGS } from '../constants/budget.constants';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { spacing, radius } from '@/constants';
import { formatExpenseAmount } from '@/features/expenses/utils/expense.utils';
import { useAppTheme } from '@/hooks';

export interface BudgetProgressProps {
  budgetAmount: number;
  spentAmount: number;
  showPercentage?: boolean;
  showTierBadge?: boolean;
  showDetails?: boolean;
  currency?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({
  budgetAmount,
  spentAmount,
  showPercentage = true,
  showTierBadge = true,
  showDetails = true,
  currency = 'INR',
  height = 8,
  style,
}) => {
  const { colors, isDark } = useAppTheme();
  const progress = calculateBudgetProgress(budgetAmount, spentAmount);
  const tierConfig = BUDGET_TIER_CONFIGS[progress.tier];

  // Visual width clamped between 0 and 100%
  const barWidth = Math.min(Math.max(progress.percentageUsed, 0), 100);

  // In dark mode, ensure tier badge background is a subtle tint
  const tierBadgeBg = isDark
    ? tierConfig.color + '26' // ~15% opacity hex
    : tierConfig.backgroundColor;

  return (
    <View style={[styles.container, style]}>
      {/* Top Meta Row */}
      {(showPercentage || showTierBadge) && (
        <View style={styles.topRow}>
          {showPercentage ? (
            <AppText variant="bodyMdMedium" color={colors.textPrimary} weight="700">
              {progress.percentageUsed}%{' '}
              <AppText variant="caption" color={colors.textSecondary}>
                used
              </AppText>
            </AppText>
          ) : (
            <View />
          )}

          {showTierBadge && (
            <View
              style={[
                styles.tierBadge,
                { backgroundColor: tierBadgeBg },
              ]}
            >
              <AppIcon
                name={tierConfig.icon}
                size={13}
                color={tierConfig.color}
                style={{ marginRight: 4 }}
              />
              <AppText
                variant="caption"
                color={tierConfig.color}
                weight="600"
              >
                {tierConfig.label}
              </AppText>
            </View>
          )}
        </View>
      )}

      {/* Progress Track */}
      <View style={[styles.track, { height, backgroundColor: colors.surfaceVariant }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${barWidth}%`,
              backgroundColor: tierConfig.color,
              height,
            },
          ]}
        />
      </View>

      {/* Bottom Spending Details */}
      {showDetails && (
        <View style={styles.detailsRow}>
          <AppText variant="caption" color={colors.textSecondary}>
            Spent:{' '}
            <AppText variant="caption" weight="600" color={colors.textPrimary}>
              {formatExpenseAmount(spentAmount, { currency })}
            </AppText>
          </AppText>

          <AppText
            variant="caption"
            color={progress.isOverBudget ? colors.danger : colors.textSecondary}
          >
            {progress.isOverBudget ? 'Exceeded by: ' : 'Remaining: '}
            <AppText
              variant="caption"
              weight="600"
              color={progress.isOverBudget ? colors.danger : colors.textPrimary}
            >
              {formatExpenseAmount(Math.abs(progress.remainingAmount), { currency })}
            </AppText>
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  track: {
    width: '100%',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radius.full,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
