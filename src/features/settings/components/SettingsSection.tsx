import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';

export interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
  style,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      {title && (
        <View style={styles.header}>
          <AppText variant="caption" color={colors.textSecondary} weight="600">
            {title.toUpperCase()}
          </AppText>
          {description && (
            <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 2 }}>
              {description}
            </AppText>
          )}
        </View>
      )}

      <AppCard variant="outlined" style={[styles.card, { backgroundColor: colors.surface }]}>
        {children}
      </AppCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  card: {
    borderRadius: radius.lg,
    padding: 0,
    overflow: 'hidden',
  },
});

