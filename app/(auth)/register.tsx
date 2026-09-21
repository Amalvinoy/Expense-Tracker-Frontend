import React, { useEffect } from 'react';
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
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm';
import { useAuthStore } from '@/store/auth.store';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { form, onSubmit, isLoading, error, clearError } = useRegisterForm();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  return (
    <ScreenContainer scrollable withPadding edges={['top', 'bottom']}>
      <AuthHeader
        title="Create Account"
        subtitle="Sign up to start tracking and analyzing your personal expenses."
        icon="account-plus-outline"
      />

      <AppCard variant="elevated" style={styles.card}>
        <AuthErrorAlert message={error || ''} onDismiss={clearError} />

        <ControlledInput
          name="name"
          control={form.control}
          label="Full Name"
          placeholder="e.g. Jane Doe"
          autoCapitalize="words"
          leftIcon={<AppIcon name="account-outline" size={20} color={colors.textSecondary} />}
        />

        <ControlledInput
          name="email"
          control={form.control}
          label="Email Address"
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          leftIcon={<AppIcon name="email-outline" size={20} color={colors.textSecondary} />}
        />

        <ControlledInput
          name="password"
          control={form.control}
          label="Password"
          placeholder="At least 8 characters"
          isPassword
          autoCapitalize="none"
          autoCorrect={false}
          leftIcon={<AppIcon name="lock-outline" size={20} color={colors.textSecondary} />}
          helperText="Must be at least 8 characters long"
        />

        <ControlledInput
          name="confirmPassword"
          control={form.control}
          label="Confirm Password"
          placeholder="Re-enter your password"
          isPassword
          autoCapitalize="none"
          autoCorrect={false}
          leftIcon={<AppIcon name="lock-check-outline" size={20} color={colors.textSecondary} />}
        />

        <AppButton
          title={isLoading ? 'Creating Account...' : 'Sign Up'}
          variant="primary"
          size="lg"
          loading={isLoading}
          onPress={onSubmit}
          fullWidth
          style={styles.submitButton}
        />

        {/* Development testing hint */}
        <View style={[styles.hintBox, { backgroundColor: colors.surfaceVariant }]}>
          <AppIcon name="information-outline" size={16} color={colors.textSecondary} />
          <AppText variant="caption" color={colors.textSecondary} style={styles.hintText}>
            Demo hint: Try exists@example.com to test duplicate account error handling.
          </AppText>
        </View>
      </AppCard>

      <AuthFooterLink
        promptText="Already have an account?"
        actionText="Log In"
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
    marginTop: spacing.md,
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
