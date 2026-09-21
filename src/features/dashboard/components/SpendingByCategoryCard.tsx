import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { AmountText } from '@/components/common/AmountText';
import { useAppTheme } from '@/hooks';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { CategorySpendingItem } from '../types/dashboard.types';

export interface SpendingByCategoryCardProps {
  categories: CategorySpendingItem[];
  currency?: string;
  onManagePress?: () => void;
}

export const SpendingByCategoryCard: React.FC<SpendingByCategoryCardProps> = ({
  categories,
  currency = 'USD',
  onManagePress,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AppText variant="headingSm" color={colors.textPrimary} style={styles.title}>
          Spending by Category
        </AppText>
        {onManagePress && (
          <Pressable onPress={onManagePress} hitSlop={8} accessibilityRole="button">
            <AppText variant="labelSm" color={colors.primary} weight="600">
              Manage
            </AppText>
          </Pressable>
        )}
      </View>

      <AppCard variant="elevated" style={styles.card}>
        {categories.map((item, index) => {
          const isLast = index === categories.length - 1;

          return (
            <View
              key={item.category}
              style={[
                styles.itemContainer,
                !isLast && [styles.itemBorder, { borderBottomColor: colors.divider }],
              ]}
            >
              {/* Category Name & Metrics */}
              <View style={styles.topRow}>
                <View style={styles.leftCol}>
                  <CategoryIcon category={item.category} size="sm" />
                  <View style={styles.nameBlock}>
                    <AppText variant="bodyMdMedium" color={colors.textPrimary} numberOfLines={1}>
                      {item.category}
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {item.percentage.toFixed(0)}% of total
                    </AppText>
                  </View>
                </View>

                <AmountText
                  amount={item.amount}
                  currency={currency}
                  type="neutral"
                  variant="bodyMdMedium"
                  showSign={false}
                />
              </View>

              {/* Progress Bar for Category */}
              <View style={[styles.progressTrack, { backgroundColor: colors.surfaceVariant }]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(Math.max(item.percentage, 0), 100)}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </AppCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: 0,
  },
  card: {
    padding: spacing.md,
  },
  itemContainer: {
    paddingVertical: spacing.sm + 2,
  },
  itemBorder: {
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameBlock: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: radius.full,
  },
});
