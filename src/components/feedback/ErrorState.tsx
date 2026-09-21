import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { AppText } from '../common/AppText';
import { AppIcon } from '../common/AppIcon';
import { AppButton } from '../common/AppButton';
import { useAppTheme } from '@/hooks';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  retryTitle?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading your data. Please try again.',
  retryTitle = 'Try Again',
  onRetry,
  style,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.dangerSoft }]}>
        <AppIcon name="alert-circle-outline" size={40} color={colors.danger} family="material" />
      </View>
      <AppText variant="headingMd" color={colors.textPrimary} align="center" style={styles.title}>
        {title}
      </AppText>
      <AppText
        variant="bodyMd"
        color={colors.textSecondary}
        align="center"
        style={styles.message}
      >
        {message}
      </AppText>
      {onRetry && (
        <AppButton
          title={retryTitle}
          onPress={onRetry}
          variant="outline"
          size="md"
          leftIcon={<AppIcon name="refresh" size={18} color={colors.textPrimary} style={{ marginRight: 6 }} />}
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  message: {
    maxWidth: 290,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  retryButton: {
    minWidth: 150,
  },
});
