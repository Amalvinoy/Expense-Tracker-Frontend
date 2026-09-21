import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { AmountText } from '@/components/common/AmountText';
import { useAppTheme } from '@/hooks';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { DashboardSummary, BudgetHealthStatus } from '../types/dashboard.types';

export interface BudgetSummaryCardProps {
  summary: DashboardSummary;
  health?: BudgetHealthStatus;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  summary,
  health = 'good',
}) => {
  const { colors } = useAppTheme();
  const {
    todaySpending,
    monthlySpending,
    monthlyBudget,
    remainingBudget,
    budgetProgressPercentage,
    currency,
  } = summary;

  // Clamped progress for width percentage
  const progressWidth = Math.min(Math.max(budgetProgressPercentage, 0), 100);

  // Status color based on budget health
  const statusColor =
    health === 'danger'
      ? colors.expense
      : health === 'warning'
      ? colors.warning
      : colors.income;

  const statusBgColor =
    health === 'danger'
      ? colors.expenseSoft
      : health === 'warning'
      ? colors.warningSoft
      : colors.incomeSoft;

  return (
    <AppCard variant="elevated" style={styles.card}>
      {/* Top Row: Today's Spending Hero */}
      <View style={styles.todayRow}>
        <View>
          <AppText variant="labelSm" color={colors.textSecondary} style={styles.sectionLabel}>
            TODAY&apos;S SPENDING
          </AppText>
          <AmountText
            amount={todaySpending}
            currency={currency}
            variant="amountHero"
            showSign={false}
          />
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
          <AppIcon
            name={health === 'danger' ? 'alert' : 'shield-check'}
            size={14}
            color={statusColor}
          />
          <AppText variant="caption" color={statusColor} weight="600">
            {health === 'danger' ? 'Over Budget' : health === 'warning' ? '80%+ Spent' : 'On Track'}
          </AppText>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* Financial Metrics Grid: This Month, Budget, Remaining */}
      <View style={styles.metricsGrid}>
        {/* Metric 1: This Month */}
        <View style={styles.metricItem}>
          <AppText variant="caption" color={colors.textSecondary}>
            This month
          </AppText>
          <AmountText
            amount={monthlySpending}
            currency={currency}
            variant="amountMedium"
            showSign={false}
          />
        </View>

        {/* Metric 2: Budget */}
        <View style={styles.metricItem}>
          <AppText variant="caption" color={colors.textSecondary}>
            Budget
          </AppText>
          <AmountText
            amount={monthlyBudget}
            currency={currency}
            variant="amountMedium"
            showSign={false}
          />
        </View>

        {/* Metric 3: Remaining */}
        <View style={styles.metricItem}>
          <AppText variant="caption" color={colors.textSecondary}>
            Remaining
          </AppText>
          <AmountText
            amount={remainingBudget}
            currency={currency}
            variant="amountMedium"
            type={remainingBudget < 0 ? 'expense' : 'income'}
            showSign={false}
          />
        </View>
      </View>

      {/* Spending Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressTextRow}>
          <AppText variant="caption" color={colors.textSecondary} weight="500">
            Spending Progress
          </AppText>
          <AppText variant="caption" color={statusColor} weight="600">
            {budgetProgressPercentage.toFixed(1)}%
          </AppText>
        </View>

        {/* Track */}
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceVariant }]}>
          <View
            style={[
              styles.progressBar,
              { width: `${progressWidth}%`, backgroundColor: statusColor },
            ]}
          />
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radius.full,
    gap: 4,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metricItem: {
    flex: 1,
  },
  progressSection: {
    marginTop: spacing.xs,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: radius.full,
  },
});
