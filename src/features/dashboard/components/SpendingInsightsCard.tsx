import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';
import {
  SpendingInsightsReport,
  InsightImpact,
} from '@/services/analytics';

export interface SpendingInsightsCardProps {
  report: SpendingInsightsReport | null;
  currencySymbol?: string;
  initialCollapsed?: boolean;
}

export const SpendingInsightsCard: React.FC<SpendingInsightsCardProps> = ({
  report,
  currencySymbol = '₹',
  initialCollapsed = false,
}) => {
  const { colors } = useAppTheme();
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [activeFilter, setActiveFilter] = useState<'all' | 'patterns' | 'budget'>('all');

  if (!report || report.insights.length === 0) {
    return null;
  }

  const { insights } = report;

  const filteredInsights = insights.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'patterns') {
      return (
        item.type === 'highest_category' ||
        item.type === 'highest_day' ||
        item.type === 'daily_average'
      );
    }
    if (activeFilter === 'budget') {
      return (
        item.type === 'budget_usage' ||
        item.type === 'period_comparison' ||
        item.type === 'unusual_spike'
      );
    }
    return true;
  });

  const getImpactColors = (impact: InsightImpact) => {
    switch (impact) {
      case 'positive':
        return {
          iconColor: colors.income,
          iconBg: colors.incomeSoft,
          badgeBg: colors.incomeSoft,
          badgeColor: colors.income,
        };
      case 'warning':
        return {
          iconColor: colors.warning,
          iconBg: colors.warningSoft,
          badgeBg: colors.warningSoft,
          badgeColor: colors.warning,
        };
      case 'negative':
        return {
          iconColor: colors.expense,
          iconBg: colors.expenseSoft,
          badgeBg: colors.expenseSoft,
          badgeColor: colors.expense,
        };
      default:
        return {
          iconColor: colors.primary,
          iconBg: colors.primarySoft,
          badgeBg: colors.surfaceVariant,
          badgeColor: colors.textSecondary,
        };
    }
  };

  return (
    <AppCard style={styles.card}>
      {/* Header with Title and Optional Collapse Toggle */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithBadge}>
          <View style={[styles.iconPill, { backgroundColor: colors.primarySoft }]}>
            <AppIcon name="lightbulb-on-outline" size={18} color={colors.primary} />
          </View>
          <AppText variant="headingSm" color={colors.textPrimary} style={styles.headerTitle}>
            Spending Insights
          </AppText>
          <View style={[styles.countBadge, { backgroundColor: colors.surfaceVariant }]}>
            <AppText variant="captionSmallMedium" color={colors.textSecondary}>
              {insights.length}
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={() => setIsCollapsed((prev) => !prev)}
          style={[styles.toggleBtn, { backgroundColor: colors.surfaceVariant }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isCollapsed ? 'Expand spending insights' : 'Hide spending insights'}
        >
          <AppText variant="captionSmallMedium" color={colors.primary}>
            {isCollapsed ? 'Show' : 'Hide'}
          </AppText>
          <AppIcon
            name={isCollapsed ? 'chevron-down' : 'chevron-up'}
            size={16}
            color={colors.primary}
          />
        </Pressable>
      </View>

      {/* When Collapsed: Glancable horizontal pills */}
      {isCollapsed ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collapsedPillContainer}
        >
          {insights.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setIsCollapsed(false)}
              style={[
                styles.collapsedChip,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
              ]}
            >
              <AppIcon name={item.icon} size={14} color={colors.primary} />
              <AppText variant="captionSmallMedium" color={colors.textPrimary}>
                {item.title}:{' '}
                <AppText variant="captionSmall" color={colors.textSecondary}>
                  {item.highlightValue || item.message.split('.')[0]}
                </AppText>
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        /* When Expanded: Full insights view */
        <View style={styles.expandedContent}>
          {/* Subtitle / Context */}
          <AppText variant="bodySm" color={colors.textSecondary} style={styles.subtitle}>
            Deterministic patterns calculated from your local monthly records.
          </AppText>

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'patterns', label: 'Spending Trends' },
                { id: 'budget', label: 'Pace & Spikes' },
              ] as const
            ).map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveFilter(tab.id)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    },
                  ]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                >
                  <AppText
                    variant="captionSmallMedium"
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  >
                    {tab.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {/* List of Insights */}
          <View style={styles.insightList}>
            {filteredInsights.map((item) => {
              const palette = getImpactColors(item.impact);
              return (
                <View
                  key={item.id}
                  style={[
                    styles.insightRow,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={[styles.itemIconContainer, { backgroundColor: palette.iconBg }]}>
                    <AppIcon name={item.icon} size={20} color={palette.iconColor} />
                  </View>

                  <View style={styles.itemTextContainer}>
                    <View style={styles.itemTitleRow}>
                      <AppText variant="captionSmallMedium" color={colors.textSecondary}>
                        {item.title.toUpperCase()}
                      </AppText>
                      {item.highlightValue && (
                        <View
                          style={[
                            styles.metricBadge,
                            { backgroundColor: palette.badgeBg },
                          ]}
                        >
                          <AppText
                            variant="captionSmallMedium"
                            color={palette.badgeColor}
                          >
                            {item.highlightValue}
                          </AppText>
                        </View>
                      )}
                    </View>

                    <AppText
                      variant="bodyMdMedium"
                      color={colors.textPrimary}
                      style={styles.messageText}
                    >
                      {item.message}
                    </AppText>

                    {item.detail && (
                      <AppText
                        variant="bodySm"
                        color={colors.textSecondary}
                        style={styles.detailText}
                      >
                        {item.detail}
                      </AppText>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconPill: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    gap: 4,
  },
  collapsedPillContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxs,
  },
  collapsedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  expandedContent: {
    marginTop: spacing.xs,
  },
  subtitle: {
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  insightList: {
    gap: spacing.sm,
  },
  insightRow: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  itemIconContainer: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  metricBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  messageText: {
    fontWeight: '600',
    lineHeight: 20,
  },
  detailText: {
    marginTop: 3,
    lineHeight: 18,
  },
});
