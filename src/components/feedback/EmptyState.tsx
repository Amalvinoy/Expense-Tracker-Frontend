import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { AppText } from '../common/AppText';
import { AppIcon } from '../common/AppIcon';
import { AppButton } from '../common/AppButton';
import { useAppTheme } from '@/hooks';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'receipt-text-outline',
  title,
  description,
  actionTitle,
  onActionPress,
  style,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primarySoft }]}>
        <AppIcon name={icon} size={40} color={colors.primary} family="material" />
      </View>
      <AppText variant="headingMd" color={colors.textPrimary} align="center" style={styles.title}>
        {title}
      </AppText>
      <AppText
        variant="bodyMd"
        color={colors.textSecondary}
        align="center"
        style={styles.description}
      >
        {description}
      </AppText>
      {actionTitle && onActionPress && (
        <AppButton
          title={actionTitle}
          onPress={onActionPress}
          variant="primary"
          size="md"
          style={styles.actionButton}
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
  description: {
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  actionButton: {
    minWidth: 160,
  },
});
