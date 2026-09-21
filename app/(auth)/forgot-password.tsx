import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppButton } from '@/components/common/AppButton';
import { AppIcon } from '@/components/common/AppIcon';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import {
  AuthHeader,
  AuthFooterLink,
  AuthErrorAlert,
  ControlledInput,
} from '@/features/auth/components';
import { useForgotPasswordForm } from '@/features/auth/hooks/useForgotPasswordForm';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { form, onSubmit, isLoading, error, successMessage, clearError } =
    useForgotPasswordForm();

  return (
    <ScreenContainer scrollable withPadding edges={['top', 'bottom']}>
      <AuthHeader
        title="Reset Password"
        subtitle="Enter your email and we'll send you recovery instructions."
        icon="lock-reset"
      />

      <AppCard variant="elevated" style={styles.card}>
        <AuthErrorAlert message={error || ''} onDismiss={clearError} />

        {successMessage ? (
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: colors.successSoft }]}>
              <AppIcon name="check-circle-outline" size={36} color={colors.success} />
            </View>
            <AppText variant="headingSm" align="center" style={styles.successTitle}>
              Reset Link Sent!
            </AppText>
            <AppText
              variant="bodyMd"
              color={colors.textSecondary}
              align="center"
              style={styles.successText}
            >
              {successMessage}
            </AppText>
            <AppButton
              title="Back to Login"
              variant="primary"
              size="md"
              onPress={() => router.push('/(auth)/login')}
              style={styles.backToLoginButton}
            />
          </View>
        ) : (
          <>
            <ControlledInput
              name="email"
              control={form.control}
              label="Registered Email Address"
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<AppIcon name="email-outline" size={20} color={colors.textSecondary} />}
              helperText="We will send a secure password reset link to this address."
            />

            <AppButton
              title={isLoading ? 'Sending...' : 'Send Recovery Email'}
              variant="primary"
              size="lg"
              loading={isLoading}
              onPress={onSubmit}
              fullWidth
              style={styles.submitButton}
            />

            <View style={[styles.hintBox, { backgroundColor: colors.surfaceVariant }]}>
              <AppIcon name="information-outline" size={16} color={colors.textSecondary} />
              <AppText variant="caption" color={colors.textSecondary} style={styles.hintText}>
                Demo hint: Enter any email to test success state. Try notfound@example.com to test error handling.
              </AppText>
            </View>
          </>
        )}
      </AppCard>

      <AuthFooterLink
        promptText="Remember your password?"
        actionText="Back to Log In"
        onPress={() => router.push('/(auth)/login')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    marginBottom: spacing.xs,
  },
  successText: {
    lineHeight: 20,
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  backToLoginButton: {
    minWidth: 160,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
    marginTop: spacing.lg,
    gap: spacing.xs + 2,
  },
  hintText: {
    flex: 1,
    lineHeight: 16,
  },
});
