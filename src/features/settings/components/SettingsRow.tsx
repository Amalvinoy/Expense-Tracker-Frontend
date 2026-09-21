import React from 'react';
import { View, StyleSheet, Pressable, Switch } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/constants';

export type SettingsRowType = 'link' | 'toggle' | 'info';

export interface SettingsRowProps {
  icon: string;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  type?: SettingsRowType;
  value?: string;
  toggleValue?: boolean;
  onToggleChange?: (val: boolean) => void;
  onPress?: () => void;
  showDivider?: boolean;
  disabled?: boolean;
  destructive?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  type = 'link',
  value,
  toggleValue = false,
  onToggleChange,
  onPress,
  showDivider = true,
  disabled = false,
  destructive = false,
}) => {
  const { colors } = useAppTheme();
  const isInteractive = (type === 'link' || onPress) && !disabled;

  const resolvedIconColor = iconColor || colors.primary;
  const resolvedIconBg = iconBg || colors.primarySoft;

  return (
    <View>
      <Pressable
        onPress={isInteractive ? onPress : undefined}
        disabled={!isInteractive}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.surface },
          pressed && isInteractive && { backgroundColor: colors.surfaceVariant },
          disabled && styles.rowDisabled,
        ]}
        accessibilityRole={type === 'toggle' ? 'switch' : 'button'}
        accessibilityState={type === 'toggle' ? { checked: toggleValue } : undefined}
      >
        {/* Left Icon */}
        <View style={[styles.iconContainer, { backgroundColor: resolvedIconBg }]}>
          <AppIcon
            name={icon}
            size={20}
            color={destructive ? colors.danger : resolvedIconColor}
          />
        </View>

        {/* Center: Title & Subtitle */}
        <View style={styles.textContainer}>
          <AppText
            variant="bodyMdMedium"
            color={destructive ? colors.danger : colors.textPrimary}
            weight="500"
          >
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
              {subtitle}
            </AppText>
          )}
        </View>

        {/* Right Content */}
        <View style={styles.rightContainer}>
          {type === 'toggle' ? (
            <Switch
              value={toggleValue}
              onValueChange={onToggleChange}
              disabled={disabled}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          ) : (
            <View style={styles.linkRight}>
              {value && (
                <AppText
                  variant="bodySm"
                  color={colors.textSecondary}
                  style={styles.valueText}
                >
                  {value}
                </AppText>
              )}
              {type === 'link' && (
                <AppIcon
                  name="chevron-right"
                  size={20}
                  color={colors.textMuted}
                />
              )}
            </View>
          )}
        </View>
      </Pressable>

      {showDivider && (
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightContainer: {
    marginLeft: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    marginRight: 4,
  },
  divider: {
    height: 1,
    marginLeft: 36 + spacing.md + spacing.md,
  },
});

