import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { AmountText } from '@/components/common/AmountText';
import { LendingSummary } from '@/features/lending/types/lending.types';
import { useAppTheme } from '@/hooks';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export interface DashboardLendingCardProps {
  summary: LendingSummary;
  totalRecords: number;
  onViewLending: () => void;
  currency?: string;
}

export const DashboardLendingCard: React.FC<DashboardLendingCardProps> = ({
  summary,
  totalRecords,
  onViewLending,
  currency = 'INR',
}) => {
  const { colors } = useAppTheme();
  const hasRecords = totalRecords > 0 || summary.totalLent > 0;

  return (
    <AppCard variant="elevated" style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconCircle, { backgroundColor: colors.warningSoft }]}>
            <AppIcon name="hand-coin-outline" size={20} color={colors.warning} />
          </View>
          <View style={{ marginLeft: spacing.sm }}>
            <AppText variant="headingSm" color={colors.textPrimary} style={styles.cardTitle}>
              Lending
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Money Lent to Others
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={onViewLending}
          style={[styles.viewButton, { backgroundColor: colors.primarySoft }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="View Lending"
        >
          <AppText variant="caption" color={colors.primary} weight="600">
            View Lending
          </AppText>
          <AppIcon name="chevron-right" size={16} color={colors.primary} />
        </Pressable>
      </View>

      {/* Content */}
      {hasRecords ? (
        <View style={[styles.metricsContainer, { backgroundColor: colors.surfaceVariant }]}>
          {/* Total Lent */}
          <View style={styles.metricColumn}>
            <AppText variant="caption" color={colors.textSecondary}>
              Total Lent
            </AppText>
            <AmountText
              amount={summary.totalLent}
              currency={currency}
              variant="bodyMdMedium"
              color={colors.textPrimary}
              showSign={false}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Total Returned */}
          <View style={styles.metricColumn}>
            <AppText variant="caption" color={colors.textSecondary}>
              Total Returned
            </AppText>
            <AmountText
              amount={summary.totalReturned}
              currency={currency}
              variant="bodyMdMedium"
              color={colors.income}
              showSign={false}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Outstanding */}
          <View style={styles.metricColumn}>
            <AppText variant="caption" color={colors.textSecondary}>
              Outstanding
            </AppText>
            <AmountText
              amount={summary.totalOutstanding}
              currency={currency}
              variant="bodyMdMedium"
              color={summary.totalOutstanding > 0 ? colors.warning : colors.textSecondary}
              showSign={false}
            />
          </View>
        </View>
      ) : (
        <View style={[styles.emptyContainer, { backgroundColor: colors.surfaceVariant }]}>
          <AppIcon name="hand-coin" size={24} color={colors.textSecondary} style={{ opacity: 0.6 }} />
          <AppText variant="caption" color={colors.textSecondary} style={styles.emptyText}>
            No active lending records. Track money lent to friends or family.
          </AppText>
          <Pressable
            onPress={onViewLending}
            style={[styles.emptyActionBtn, { borderColor: colors.primary }]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Record Lending"
          >
            <AppText variant="caption" color={colors.primary} weight="600">
              + Record Lending
            </AppText>
          </Pressable>
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontWeight: '700',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: 2,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xxs,
  },
  divider: {
    width: 1,
    height: 28,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
  emptyActionBtn: {
    marginTop: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
});
