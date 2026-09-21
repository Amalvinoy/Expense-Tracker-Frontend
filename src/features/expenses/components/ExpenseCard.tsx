import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AmountText } from '@/components/common/AmountText';
import { AppIcon } from '@/components/common/AppIcon';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { Expense } from '../types/expense.types';
import { formatExpenseDate } from '../utils/expense.utils';
import { spacing, radius, shadows } from '@/constants';
import { useAppTheme } from '@/hooks';

export interface ExpenseCardProps {
  expense: Expense;
  currency?: string;
  onPress?: (expense: Expense) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  currency = 'INR',
  onPress,
}) => {
  const { colors } = useAppTheme();
  const { amount, categoryName, paymentMethod, note, date } = expense;
  const formattedDate = formatExpenseDate(date);

  return (
    <Pressable
      onPress={() => onPress?.(expense)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? colors.surfaceVariant : colors.surface,
          borderColor: colors.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${categoryName} expense of ${amount}`}
    >
      {/* Left: Category Icon */}
      <CategoryIcon category={categoryName} size="md" />

      {/* Center: Title, Note, Payment Method & Date */}
      <View style={styles.centerCol}>
        <View style={styles.titleRow}>
          <AppText variant="bodyMdMedium" color={colors.textPrimary} numberOfLines={1} style={styles.categoryTitle}>
            {categoryName}
          </AppText>
        </View>

        {note ? (
          <AppText
            variant="caption"
            color={colors.textSecondary}
            numberOfLines={1}
            style={styles.noteText}
          >
            {note}
          </AppText>
        ) : null}

        <View style={styles.metaRow}>
          <View style={[styles.paymentMethodPill, { backgroundColor: colors.surfaceVariant }]}>
            <AppIcon name="credit-card-outline" size={12} color={colors.textSecondary} />
            <AppText variant="caption" color={colors.textSecondary} style={{ marginLeft: 3 }}>
              {paymentMethod}
            </AppText>
          </View>

          <AppText variant="caption" color={colors.textMuted}>
            • {formattedDate}
          </AppText>
        </View>
      </View>

      {/* Right: Expense Amount */}
      <View style={styles.amountCol}>
        <AmountText
          amount={amount}
          currency={currency}
          type="expense"
          variant="amountSmall"
          showSign={false}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs + 2,
    borderWidth: 1,
    ...shadows.subtle,
  },
  centerCol: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryTitle: {
    fontWeight: '600',
  },
  noteText: {
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  paymentMethodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.full,
  },
  amountCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
