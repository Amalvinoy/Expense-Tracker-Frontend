import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PaymentMethodBreakdownItem } from '../types/report.types';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';
import { formatExpenseAmount } from '@/features/expenses/utils/expense.utils';

export interface PaymentMethodBreakdownCardProps {
  methods: PaymentMethodBreakdownItem[];
  currency?: string;
}

export const PaymentMethodBreakdownCard: React.FC<PaymentMethodBreakdownCardProps> = ({
  methods,
  currency = 'INR',
}) => {
  const { colors } = useAppTheme();

  if (methods.length === 0) {
    return null;
  }

  const methodColors: Record<string, { bar: string; iconBg: string }> = {
    UPI: { bar: colors.primary, iconBg: colors.primarySoft },
    Cash: { bar: colors.income, iconBg: colors.incomeSoft },
    'Credit Card': { bar: colors.investment, iconBg: colors.investmentSoft },
    'Debit Card': { bar: colors.info, iconBg: colors.infoSoft },
    'Bank Transfer': { bar: colors.warning, iconBg: colors.warningSoft },
    Other: { bar: colors.textSecondary, iconBg: colors.surfaceVariant },
  };

  return (
    <AppCard variant="elevated" style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <AppText variant="headingSm">Payment Channels</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          Distribution by payment instrument
        </AppText>
      </View>

      {/* Stacked Multi-Segment Progress Bar */}
      <View style={[styles.stackedBarContainer, { backgroundColor: colors.surfaceVariant }]}>
        {methods.map((item) => {
          const colorConfig = methodColors[item.method] || methodColors.Other;
          if (item.percentage <= 0) return null;

          return (
            <View
              key={item.method}
              style={[
                styles.stackedBarSegment,
                {
                  width: `${Math.max(item.percentage, 2)}%`,
                  backgroundColor: colorConfig.bar,
                },
              ]}
            />
          );
        })}
      </View>

      {/* List */}
      <View style={styles.list}>
        {methods.map((item, index) => {
          const isLast = index === methods.length - 1;
          const colorConfig = methodColors[item.method] || methodColors.Other;

          return (
            <View
              key={item.method}
              style={[
                styles.itemRow,
                !isLast && [styles.itemBorder, { borderBottomColor: colors.divider }],
              ]}
            >
              <View style={styles.itemLeft}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: colorConfig.iconBg },
                  ]}
                >
                  <AppIcon
                    name={item.icon}
                    size={18}
                    color={colorConfig.bar}
                  />
                </View>

                <View style={styles.itemInfo}>
                  <View style={styles.methodNameRow}>
                    <AppText variant="bodyMdMedium" weight="600">
                      {item.method}
                    </AppText>
                    <View style={[styles.countBadge, { backgroundColor: colors.surfaceVariant }]}>
                      <AppText variant="caption" color={colors.textSecondary}>
                        {item.count} txns
                      </AppText>
                    </View>
                  </View>

                  <AppText variant="caption" color={colors.textSecondary}>
                    {item.percentage}% of spending
                  </AppText>
                </View>
              </View>

              <View style={styles.itemRight}>
                <AppText variant="bodyMdMedium" weight="700">
                  {formatExpenseAmount(item.amount)}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  stackedBarContainer: {
    flexDirection: 'row',
    height: 10,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  stackedBarSegment: {
    height: '100%',
  },
  list: {
    gap: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
  },
  itemBorder: {
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  methodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  itemRight: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
});
