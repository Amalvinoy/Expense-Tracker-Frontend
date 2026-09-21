import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
 import { AmountText } from '@/components/common/AmountText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/constants/spacing';

export interface DateGroupHeaderProps {
  displayDate: string;
  totalAmount: number;
  currency?: string;
}

export const DateGroupHeader: React.FC<DateGroupHeaderProps> = ({
  displayDate,
  totalAmount,
  currency = 'INR',
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppText
        variant="labelMd"
        color={colors.textSecondary}
        style={styles.dateText}
        numberOfLines={1}
      >
        {displayDate.toUpperCase()}
      </AppText>

      <View style={styles.totalRow}>
        <AppText variant="caption" color={colors.textMuted} style={{ marginRight: 4 }}>
          Day Total:
        </AppText>
        <AmountText
          amount={totalAmount}
          currency={currency}
          type="expense"
          variant="labelSm"
          showSign={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  dateText: {
    letterSpacing: 0.5,
    fontWeight: '700',
    flexShrink: 1,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    marginLeft: spacing.sm,
  },
});

