import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { useAppTheme } from '@/hooks';
import { spacing } from '@/constants/spacing';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  style,
}) => {
  const { colors } = useAppTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftRow}>
        {showBack && (
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <AppIcon name="chevron-left" size={28} color={colors.textPrimary} />
          </Pressable>
        )}

        <View style={styles.titleContainer}>
          <AppText variant="headingLg" color={colors.textPrimary} numberOfLines={1}>
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="bodySm" color={colors.textSecondary} numberOfLines={1}>
              {subtitle}
            </AppText>
          )}
        </View>
      </View>

      {rightAction && <View style={styles.rightActionContainer}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
    minHeight: 56,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xxs,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
});
