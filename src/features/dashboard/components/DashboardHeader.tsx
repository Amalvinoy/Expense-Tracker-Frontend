import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

export interface DashboardHeaderProps {
  greeting: string;
  date: string;
  userName?: string;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  unreadNotificationsCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  greeting,
  date,
  userName,
  onNotificationPress,
  onProfilePress,
  unreadNotificationsCount = 0,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textColumn}>
        <AppText variant="headingLg" color={colors.textPrimary} style={styles.greetingText}>
          {greeting}
        </AppText>
        <AppText variant="bodyMdMedium" color={colors.textSecondary} style={styles.dateText}>
          {date}
        </AppText>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={onNotificationPress}
          style={[
            styles.iconButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <AppIcon name="bell-outline" size={22} color={colors.textPrimary} />
          {unreadNotificationsCount > 0 && (
            <View style={[styles.notificationDot, { backgroundColor: colors.expense }]} />
          )}
        </Pressable>

        <Pressable
          onPress={onProfilePress}
          style={[
            styles.avatarButton,
            {
              backgroundColor: colors.primarySoft,
            },
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="User profile"
        >
          <AppIcon name="account" size={20} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.xs,
  },
  textColumn: {
    flex: 1,
  },
  greetingText: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  dateText: {
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
