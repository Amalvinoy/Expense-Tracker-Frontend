import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { UserProfileSettings } from '../types/settings.types';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';

export interface ProfileHeaderCardProps {
  profile: UserProfileSettings;
  onEditPress: () => void;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  profile,
  onEditPress,
}) => {
  const { colors } = useAppTheme();

  // Get initials from name
  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <AppCard variant="elevated" style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.container}>
        {/* Avatar Placeholder with Camera Badge */}
        <Pressable
          onPress={onEditPress}
          style={styles.avatarContainer}
          accessibilityRole="button"
          accessibilityLabel="Change avatar placeholder"
        >
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight },
            ]}
          >
            <AppText variant="headingMd" color={colors.primary} weight="700">
              {initials}
            </AppText>
          </View>
          <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
            <AppIcon name="camera" size={12} color="#FFFFFF" />
          </View>
        </Pressable>

        {/* User Details */}
        <View style={styles.infoCol}>
          <AppText variant="headingSm" weight="700" numberOfLines={1}>
            {profile.name}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
            {profile.email}
          </AppText>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <AppText variant="caption" color={colors.success} weight="600">
              Verified Account
            </AppText>
          </View>
        </View>

        {/* Edit Button */}
        <Pressable
          onPress={onEditPress}
          style={[styles.editBtn, { backgroundColor: colors.primarySoft }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Edit profile details"
        >
          <AppIcon name="pencil-outline" size={18} color={colors.primary} />
        </Pressable>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: radius.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    marginRight: 5,
  },
  editBtn: {
    padding: spacing.xs,
    borderRadius: radius.full,
    marginLeft: spacing.xs,
  },
});

