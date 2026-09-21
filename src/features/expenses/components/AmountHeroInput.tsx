import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/constants/spacing';
 import { radius } from '@/constants/radius';
import { CURRENCY_SYMBOL } from '../constants/expense.constants';

export interface AmountHeroInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  currency?: string;
}

export const AmountHeroInput: React.FC<AmountHeroInputProps> = ({
  value,
  onChangeText,
  error,
  currency = CURRENCY_SYMBOL,
}) => {
  const { colors } = useAppTheme();

  const handleAmountChange = (text: string) => {
    // Only allow numbers and at most one decimal point
    const sanitized = text.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return; // limit to 2 decimal places
    onChangeText(sanitized);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <AppText variant="caption" color={colors.textSecondary} style={styles.label}>
        ENTER AMOUNT
      </AppText>

      <View
        style={[
          styles.inputRow,
          error ? [styles.inputRowError, { borderBottomColor: colors.danger }] : null,
        ]}
      >
        <AppText variant="amountHero" color={colors.primary} style={styles.currencyPrefix}>
          {currency}
        </AppText>
        <TextInput
          value={value}
          onChangeText={handleAmountChange}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          style={[styles.textInput, { color: colors.textPrimary }]}
          maxLength={10}
          autoFocus
          selectionColor={colors.primary}
        />
      </View>

      {error && (
        <AppText variant="caption" color={colors.danger} align="center" style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
  },
  label: {
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  inputRowError: {
    borderBottomWidth: 1,
  },
  currencyPrefix: {
    marginRight: spacing.xs,
  },
  textInput: {
    fontSize: 40,
    fontWeight: '700',
    minWidth: 100,
    textAlign: 'center',
    padding: 0,
  },
  errorText: {
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});

