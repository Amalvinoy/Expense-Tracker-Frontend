import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export interface AuthHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  icon = 'wallet-outline',
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primarySoft }]}>
        <AppIcon name={icon} size={32} color={colors.primary} family="material" />
      </View>
      <AppText variant="headingXl" align="center" style={styles.title}>
        {title}
      </AppText>
      <AppText
        variant="bodyMd"
        color={colors.textSecondary}
        align="center"
        style={styles.subtitle}
      >
        {subtitle}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    maxWidth: 280,
    lineHeight: 20,
  },
});
