import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppIcon } from '@/components/common/AppIcon';
import { shadows } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export interface QuickAddButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

export const QuickAddButton: React.FC<QuickAddButtonProps> = ({ onPress, style }) => {
  return (
    <AppButton
      title="Add Expense"
      variant="primary"
      size="md"
      leftIcon={<AppIcon name="plus" size={20} color="#FFFFFF" />}
      onPress={onPress}
      style={[styles.button, style]}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.medium,
  },
});
