import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/common/AppButton';
import { AppIcon } from '@/components/common/AppIcon';
import { AppCard } from '@/components/common/AppCard';
import {
  AuthHeader,
  AuthFooterLink,
  AuthErrorAlert,
  ControlledInput,
} from '@/features/auth/components';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { useAuthStore } from '@/store/auth.store';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { form, onSubmit, isLoading, error, clearError } = useLoginForm();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  return (
    <ScreenContainer scrollable withPadding edges={['top', 'bottom']}>
      <AuthHeader
        title="Welcome Back"
        subtitle="Log in to track, manage, and monitor your personal expenses."
        icon="wallet-outline"
      />

      <AppCard variant="elevated" style={styles.card}>
        <AuthErrorAlert message={error || ''} onDismiss={clearError} />

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
          placeholder="Enter at least 8 characters"
          isPassword
          autoCapitalize="none"
          autoCorrect={false}
          leftIcon={<AppIcon name="lock-outline" size={20} color={colors.textSecondary} />}
        />

        <View style={styles.forgotPasswordContainer}>
          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            hitSlop={8}
            accessibilityRole="button"
          >
            <AppText variant="labelSm" color={colors.primary} weight="600">
              Forgot Password?
            </AppText>
          </Pressable>
        </View>

        <AppButton
          title={isLoading ? 'Logging In...' : 'Log In'}
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
            Demo hint: Use any email and 8+ char password. Try error@example.com to test API error state.
          </AppText>
        </View>
      </AppCard>

      <AuthFooterLink
        promptText="Don't have an account?"
        actionText="Sign Up"
        onPress={() => router.push('/(auth)/register')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: -spacing.xs,
  },
  submitButton: {
    marginTop: spacing.xs,
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
