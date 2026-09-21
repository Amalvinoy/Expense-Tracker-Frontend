import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText, Line, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { MonthlySpendingDataPoint } from '../types/report.types';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';
import { formatExpenseAmount } from '@/features/expenses/utils/expense.utils';

export interface MonthlySpendingBarChartProps {
  data: MonthlySpendingDataPoint[];
  currency?: string;
}

export const MonthlySpendingBarChart: React.FC<MonthlySpendingBarChartProps> = ({
  data,
  currency = 'INR',
}) => {
  const { colors, isDark } = useAppTheme();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - spacing.lg * 2 - spacing.md * 2;
  const chartHeight = 180;
  const bottomLabelHeight = 26;
  const topPadding = 26;
  const availableBarHeight = chartHeight - bottomLabelHeight - topPadding;

  const [selectedMonth, setSelectedMonth] = useState<MonthlySpendingDataPoint | null>(null);

  const maxAmount = Math.max(...data.map((d) => d.amount), 1000);
  // Give 15% headroom above max amount
  const yMax = maxAmount * 1.15;

  const barCount = data.length || 6;
  const totalBarSpace = chartWidth / barCount;
  const barWidth = Math.min(28, totalBarSpace * 0.55);

  const formatShortAmount = (val: number): string => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${Math.round(val / 1000)}k`;
    if (val > 0) return `₹${Math.round(val)}`;
    return '0';
  };

  return (
    <AppCard variant="elevated" style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.headerRow}>
        <View>
          <AppText variant="headingSm">Monthly Spending Trend</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Last 6 months comparison
          </AppText>
        </View>

        {selectedMonth ? (
          <View style={[styles.selectedBadge, { backgroundColor: colors.surfaceVariant }]}>
            <AppText variant="caption" color={colors.primary} weight="600">
              {selectedMonth.monthName}: {formatExpenseAmount(selectedMonth.amount)}
            </AppText>
          </View>
        ) : (
          <View style={[styles.selectedBadge, { backgroundColor: colors.surfaceVariant }]}>
            <AppText variant="caption" color={colors.textSecondary}>
              Tap bar for details
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
              <Stop offset="1" stopColor={colors.primaryDark} stopOpacity="0.85" />
            </LinearGradient>
            <LinearGradient id="highlightGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#38BDF8" stopOpacity="1" />
              <Stop offset="1" stopColor={colors.primary} stopOpacity="0.95" />
            </LinearGradient>
            <LinearGradient id="defaultGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor={isDark ? 'rgba(59, 130, 246, 0.45)' : '#93C5FD'}
                stopOpacity="0.9"
              />
              <Stop
                offset="1"
                stopColor={isDark ? 'rgba(59, 130, 246, 0.25)' : '#BFDBFE'}
                stopOpacity="0.75"
              />
            </LinearGradient>
          </Defs>

          {/* Gridlines */}
          <Line
            x1="0"
            y1={topPadding}
            x2={chartWidth}
            y2={topPadding}
            stroke={colors.divider}
            strokeDasharray="4, 4"
            strokeWidth="1"
          />
          <Line
            x1="0"
            y1={topPadding + availableBarHeight / 2}
            x2={chartWidth}
            y2={topPadding + availableBarHeight / 2}
            stroke={colors.divider}
            strokeDasharray="4, 4"
            strokeWidth="1"
          />
          <Line
            x1="0"
            y1={chartHeight - bottomLabelHeight}
            x2={chartWidth}
            y2={chartHeight - bottomLabelHeight}
            stroke={colors.border}
            strokeWidth="1"
          />

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = item.amount > 0 ? (item.amount / yMax) * availableBarHeight : 4;
            const x = index * totalBarSpace + (totalBarSpace - barWidth) / 2;
            const y = chartHeight - bottomLabelHeight - barHeight;
            const isSelected = selectedMonth?.monthKey === item.monthKey;
            const isLatestMonth = index === data.length - 1;

            let fill = 'url(#defaultGradient)';
            if (isSelected) {
              fill = 'url(#highlightGradient)';
            } else if (isLatestMonth) {
              fill = 'url(#primaryGradient)';
            }

            return (
              <G key={item.monthKey}>
                {/* Bar */}
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={5}
                  ry={5}
                  fill={fill}
                  onPress={() => setSelectedMonth(item)}
                />

                {/* Amount on top of bar if space permits */}
                {item.amount > 0 && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={Math.max(14, y - 6)}
                    fontSize="9"
                    fontWeight="600"
                    fill={isSelected ? colors.primary : colors.textSecondary}
                    textAnchor="middle"
                  >
                    {formatShortAmount(item.amount)}
                  </SvgText>
                )}

                {/* Month Label below bar */}
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - 8}
                  fontSize="11"
                  fontWeight={isSelected || isLatestMonth ? '700' : '500'}
                  fill={isSelected || isLatestMonth ? colors.textPrimary : colors.textSecondary}
                  textAnchor="middle"
                >
                  {item.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  selectedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

