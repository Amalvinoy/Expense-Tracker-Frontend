import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { AmountText } from '@/components/common/AmountText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';

export interface ReportStatCardProps {
  title: string;
  amount?: number;
  valueText?: string;
  subtext?: string;
  icon: string;
  iconColor?: string;
  iconBg?: string;
  style?: StyleProp<ViewStyle>;
  highlight?: boolean;
}

export const ReportStatCard: React.FC<ReportStatCardProps> = ({
  title,
  amount,
  valueText,
  subtext,
  icon,
  iconColor,
  iconBg,
  style,
  highlight = false,
}) => {
  const { colors } = useAppTheme();
  const resolvedIconColor = iconColor || colors.primary;
  const resolvedIconBg = iconBg || colors.primarySoft;

  return (
    <AppCard
      variant={highlight ? 'elevated' : 'outlined'}
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        highlight && { borderColor: colors.primaryLight, borderWidth: 1 },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: resolvedIconBg }]}>
          <AppIcon name={icon} size={20} color={resolvedIconColor} />
        </View>
        <AppText variant="caption" color={colors.textSecondary} weight="600">
          {title.toUpperCase()}
        </AppText>
      </View>

      <View style={styles.contentContainer}>
        {amount !== undefined ? (
          <AmountText
            amount={amount}
            variant="headingMd"
            type="neutral"
            showSign={false}
          />
        ) : (
          <AppText variant="headingSm" weight="700" numberOfLines={1}>
            {valueText || '—'}
          </AppText>
        )}

        {subtext ? (
          <AppText
            variant="caption"
            color={colors.textSecondary}
            numberOfLines={1}
            style={styles.subtext}
          >
            {subtext}
          </AppText>
        ) : null}
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  contentContainer: {
    marginTop: spacing.xxs,
  },
  subtext: {
    marginTop: 2,
  },
});

