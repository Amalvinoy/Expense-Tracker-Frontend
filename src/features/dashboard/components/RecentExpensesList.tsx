import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { AmountText } from '@/components/common/AmountText';
import { useAppTheme } from '@/hooks';
import { spacing } from '@/constants/spacing';
import { ExpenseItem } from '../types/dashboard.types';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

export interface RecentExpensesListProps {
  expenses: ExpenseItem[];
  currency?: string;
  onExpensePress?: (expense: ExpenseItem) => void;
  onItemPress?: (expense: ExpenseItem) => void;
  onSeeAllPress?: () => void;
}

export const RecentExpensesList: React.FC<RecentExpensesListProps> = ({
  expenses,
  currency = 'USD',
  onExpensePress,
  onItemPress,
  onSeeAllPress,
}) => {
  const { colors } = useAppTheme();
  const handlePress = onItemPress ?? onExpensePress;

  const formatItemDate = (dateStr: string) => {
    try {
      const parsed = parseISO(dateStr);
      if (isToday(parsed)) return 'Today';
      if (isYesterday(parsed)) return 'Yesterday';
      return format(parsed, 'MMM d');
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AppText variant="headingSm" color={colors.textPrimary}>Recent Expenses</AppText>
        {onSeeAllPress && (
          <Pressable onPress={onSeeAllPress} hitSlop={8} accessibilityRole="button">
            <AppText variant="labelMd" color={colors.primary}>
              See all
            </AppText>
          </Pressable>
        )}
      </View>

      <AppCard variant="elevated" style={styles.card}>
        {expenses.map((expense, index) => {
          const isLast = index === expenses.length - 1;
          const dateLabel = formatItemDate(expense.date);

          return (
            <Pressable
              key={expense.id}
              onPress={() => handlePress?.(expense)}
              style={({ pressed }) => [
                styles.itemRow,
                !isLast && [styles.itemBorder, { borderBottomColor: colors.divider }],
                pressed && styles.itemPressed,
              ]}
              accessibilityRole="button"
            >
              <CategoryIcon category={expense.category} size="md" />

              <View style={styles.itemDetails}>
                <AppText variant="bodyMdMedium" color={colors.textPrimary} numberOfLines={1}>
                  {expense.title}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {expense.category} • {dateLabel}
                </AppText>
              </View>

              <AmountText
                amount={expense.amount}
                currency={currency}
                type="expense"
                variant="amountSmall"
                showSign={false}
              />
            </Pressable>
          );
        })}
      </AppCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  card: {
    padding: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  itemBorder: {
    borderBottomWidth: 1,
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
});
