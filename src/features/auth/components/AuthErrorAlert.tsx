import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export interface AuthErrorAlertProps {
  message: string;
  onDismiss?: () => void;
}

export const AuthErrorAlert: React.FC<AuthErrorAlertProps> = ({ message, onDismiss }) => {
  const { colors } = useAppTheme();

  if (!message) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.dangerSoft,
          borderColor: colors.expenseLight,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <AppIcon
          name="alert-circle"
          size={20}
          color={colors.danger}
          style={styles.icon}
        />
        <AppText variant="bodySmMedium" color={colors.danger} style={styles.text}>
          {message}
        </AppText>
      </View>
      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          hitSlop={8}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Dismiss error"
        >
          <AppIcon name="close" size={16} color={colors.danger} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.lg,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    flex: 1,
    lineHeight: 18,
  },
  closeButton: {
    marginLeft: spacing.sm,
    padding: spacing.xxs,
  },
});
