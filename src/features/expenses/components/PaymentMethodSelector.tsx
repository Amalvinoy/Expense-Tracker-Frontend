import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '@/components/common/AppText';
 import { AppIcon } from '@/components/common/AppIcon';
import { PaymentMethod } from '../types/expense.types';
import { PAYMENT_METHODS } from '../constants/expense.constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  error?: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  error,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <AppText variant="labelMd" color={colors.textPrimary} style={styles.label}>
        Payment Method
      </AppText>

      <View style={styles.pillsContainer}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.value;

          return (
            <Pressable
              key={method.value}
              onPress={() => onSelectMethod(method.value)}
              style={({ pressed }) => [
                styles.pill,
                {
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
                isSelected && { backgroundColor: colors.primarySoft },
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <AppIcon
                name={method.icon}
                size={16}
                color={isSelected ? colors.primary : colors.textSecondary}
                style={{ marginRight: spacing.xs }}
              />
              <AppText
                variant="bodySm"
                color={isSelected ? colors.primary : colors.textPrimary}
                weight={isSelected ? '600' : '400'}
              >
                {method.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {error && (
        <AppText variant="caption" color={colors.danger} style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderRadius: radius.full,
  },
  errorText: {
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});

