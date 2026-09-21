import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/constants/spacing';

export interface AuthFooterLinkProps {
  promptText: string;
  actionText: string;
  onPress: () => void;
}

export const AuthFooterLink: React.FC<AuthFooterLinkProps> = ({
  promptText,
  actionText,
  onPress,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <AppText variant="bodyMd" color={colors.textSecondary}>
        {promptText}{' '}
      </AppText>
      <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
        <AppText variant="bodyMdMedium" color={colors.primary} weight="600">
          {actionText}
        </AppText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
});
