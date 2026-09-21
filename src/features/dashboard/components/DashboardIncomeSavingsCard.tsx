import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { AmountText } from '@/components/common/AmountText';
import { MonthlyFinancialSummary } from '@/features/income/types/income.types';
import { useAppTheme } from '@/hooks';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export interface DashboardIncomeSavingsCardProps {
  summary: MonthlyFinancialSummary;
  onViewDetails: () => void;
  currency?: string;
}

export const DashboardIncomeSavingsCard: React.FC<DashboardIncomeSavingsCardProps> = ({
  summary,
  onViewDetails,
  currency = 'INR',
}) => {
  const { colors } = useAppTheme();
  const hasIncome = summary.hasIncomeRecorded;
  const isDeficit = summary.isDeficit;

  return (
    <AppCard variant="elevated" style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconCircle, { backgroundColor: colors.incomeSoft }]}>
            <AppIcon name="wallet" size={20} color={colors.income} />
          </View>
          <View style={{ marginLeft: spacing.sm }}>
            <AppText variant="headingSm" color={colors.textPrimary} style={styles.cardTitle}>
              Income & Savings
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Monthly Financial Overview
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={onViewDetails}
          style={[styles.viewButton, { backgroundColor: colors.primarySoft }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="View Income and Savings Details"
        >
          <AppText variant="caption" color={colors.primary} weight="600">
            View Details
          </AppText>
          <AppIcon name="chevron-right" size={16} color={colors.primary} />
        </Pressable>
      </View>

      {/* Main Metrics */}
      {hasIncome ? (
        <View style={[styles.metricsContainer, { backgroundColor: colors.surfaceVariant }]}>
          {/* Monthly Income */}
          <View style={styles.metricColumn}>
            <AppText variant="caption" color={colors.textSecondary}>
              Monthly Income
            </AppText>
            <AmountText
              amount={summary.monthlyIncome}
              currency={currency}
              variant="amountSmall"
              color={colors.textPrimary}
            />
          </View>

          {/* Divider */}
          <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

          {/* Total Expenses */}
          <View style={styles.metricColumn}>
            <AppText variant="caption" color={colors.textSecondary}>
              Expenses
            </AppText>
            <AmountText
              amount={summary.totalExpenses}
              currency={currency}
              variant="amountSmall"
              color={colors.textPrimary}
            />
          </View>

          {/* Divider */}
          <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

          {/* Savings / Deficit */}
          <View style={styles.metricColumn}>
            <AppText variant="caption" color={isDeficit ? colors.expense : colors.textSecondary}>
              {isDeficit ? 'Deficit' : 'Net Savings'}
            </AppText>
            <AmountText
              amount={Math.abs(summary.savings)}
              currency={currency}
              variant="amountSmall"
              color={isDeficit ? colors.expense : colors.income}
              showSign={isDeficit}
            />
          </View>
        </View>
      ) : (
        <View style={[styles.noIncomeContainer, { backgroundColor: colors.surfaceVariant }]}>
          <View style={styles.noIncomeTextGroup}>
            <AppIcon name="information-circle-outline" size={18} color={colors.textSecondary} />
            <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1, marginLeft: 6 }}>
              No income recorded for this month yet.
            </AppText>
          </View>
          <Pressable
            onPress={onViewDetails}
            style={[styles.recordBtn, { backgroundColor: colors.primary }]}
          >
            <AppText variant="caption" color="#FFFFFF" weight="600">
              Set Income
            </AppText>
          </Pressable>
        </View>
      )}

      {/* Savings Percentage Badge (when income is recorded) */}
      {hasIncome ? (
        <View style={styles.footerRow}>
          <View
            style={[
              styles.rateBadge,
              {
                backgroundColor: isDeficit
                  ? colors.expenseSoft
                  : colors.incomeSoft,
              },
            ]}
          >
            <AppIcon
              name={isDeficit ? 'trending-down' : 'trending-up'}
              size={14}
              color={isDeficit ? colors.expense : colors.income}
            />
            <AppText
              variant="caption"
              color={isDeficit ? colors.expense : colors.income}
              weight="600"
              style={{ marginLeft: 4 }}
            >
              {isDeficit
                ? `Deficit of ${Math.abs(summary.savingsPercentage).toFixed(1)}%`
                : `${summary.savingsPercentage.toFixed(1)}% Savings Rate`}
            </AppText>
          </View>

          <AppText variant="caption" color={colors.textSecondary}>
            Cash: ₹{summary.cashExpenses.toLocaleString('en-IN')} • UPI: ₹{summary.upiExpenses.toLocaleString('en-IN')}
          </AppText>
        </View>
      ) : null}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    gap: 2,
  },
  metricsContainer: {
    flexDirection: 'row',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 28,
  },
  noIncomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: 4,
  },
  noIncomeTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  recordBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: 4,
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
});
