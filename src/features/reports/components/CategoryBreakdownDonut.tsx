import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { CategoryBreakdownItem } from '../types/report.types';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';
import { formatExpenseAmount } from '@/features/expenses/utils/expense.utils';

export interface CategoryBreakdownDonutProps {
  categories: CategoryBreakdownItem[];
  totalSpending: number;
  currency?: string;
}

export const CategoryBreakdownDonut: React.FC<CategoryBreakdownDonutProps> = ({
  categories,
  totalSpending,
  currency = 'INR',
}) => {
  const { colors } = useAppTheme();

  if (categories.length === 0) {
    return (
      <AppCard variant="elevated" style={[styles.card, { backgroundColor: colors.surface }]}>
        <AppText variant="headingSm">Category Breakdown</AppText>
        <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
          No expenses recorded in this period.
        </AppText>
      </AppCard>
    );
  }

  // Donut geometry constants
  const size = 180;
  const strokeWidth = 22;
  const radiusVal = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusVal;
  const center = size / 2;

  // Compute stroke offsets for each category segment purely without mutation
  const segments = categories.map((cat, index) => {
    const prevPercentage = categories
      .slice(0, index)
      .reduce((sum, c) => sum + c.percentage, 0);
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((prevPercentage / 100) * circumference);
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <AppCard variant="elevated" style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <AppText variant="headingSm">Category Breakdown</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          Spending share across categories
        </AppText>
      </View>

      {/* Donut Visual with Centered Total */}
      <View style={styles.donutContainer}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {/* Background track circle */}
            <Circle
              cx={center}
              cy={center}
              r={radiusVal}
              stroke={colors.surfaceVariant}
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Colored category segments */}
            {segments.map((seg) => (
              <Circle
                key={seg.id || seg.name}
                cx={center}
                cy={center}
                r={radiusVal}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            ))}
          </G>
        </Svg>

        {/* Center Label */}
        <View style={styles.donutCenter}>
          <AppText variant="caption" color={colors.textSecondary} weight="500">
            TOTAL
          </AppText>
          <AppText variant="headingSm" weight="700" numberOfLines={1}>
            {formatExpenseAmount(totalSpending, { showDecimals: false })}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {categories.length} {categories.length === 1 ? 'cat' : 'cats'}
          </AppText>
        </View>
      </View>

      {/* Itemized Category List */}
      <View style={[styles.listContainer, { borderTopColor: colors.divider }]}>
        {categories.map((item, index) => {
          const isLast = index === categories.length - 1;

          return (
            <View
              key={item.id || item.name}
              style={[
                styles.itemRow,
                !isLast && [styles.itemBorder, { borderBottomColor: colors.divider }],
              ]}
            >
              <View style={styles.itemLeft}>
                <CategoryIcon
                  category={item.name}
                  iconName={item.icon}
                  color={item.color}
                  backgroundColor={item.backgroundColor}
                  size="sm"
                />

                <View style={styles.itemInfo}>
                  <View style={styles.itemNameRow}>
                    <AppText variant="bodyMdMedium" weight="600" numberOfLines={1}>
                      {item.name}
                    </AppText>
                    <View style={[styles.countBadge, { backgroundColor: colors.surfaceVariant }]}>
                      <AppText variant="caption" color={colors.textSecondary}>
                        {item.count}
                      </AppText>
                    </View>
                  </View>

                  {/* Horizontal mini bar */}
                  <View style={[styles.miniBarTrack, { backgroundColor: colors.surfaceVariant }]}>
                    <View
                      style={[
                        styles.miniBarFill,
                        {
                          width: `${Math.min(100, Math.max(item.percentage, 3))}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.itemRight}>
                <AppText variant="bodyMdMedium" weight="700">
                  {formatExpenseAmount(item.amount)}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {item.percentage}%
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
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
    position: 'relative',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
  },
  listContainer: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    paddingTop: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  itemBorder: {
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  itemInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  miniBarTrack: {
    height: 4,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
});

