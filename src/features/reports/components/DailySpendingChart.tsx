import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { DailySpendingDataPoint } from '../types/report.types';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';
import { formatExpenseAmount } from '@/features/expenses/utils/expense.utils';

export interface DailySpendingChartProps {
  data: DailySpendingDataPoint[];
  dailyAverage: number;
  currency?: string;
}

export const DailySpendingChart: React.FC<DailySpendingChartProps> = ({
  data,
  dailyAverage,
  currency = 'INR',
}) => {
  const { colors } = useAppTheme();
  const [selectedDay, setSelectedDay] = useState<DailySpendingDataPoint | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth - spacing.lg * 2 - spacing.md * 2;
  const chartHeight = 160;
  const bottomLabelHeight = 22;
  const topPadding = 20;
  const availableBarHeight = chartHeight - bottomLabelHeight - topPadding;

  const maxAmount = Math.max(...data.map((d) => d.amount), dailyAverage, 100);
  const yMax = maxAmount * 1.15;

  // For long periods (e.g. 30 days), allow horizontal scrolling if bars get too thin
  const minBarWidth = 10;
  const barGap = 4;
  const neededWidth = data.length * (minBarWidth + barGap);
  const isScrollable = neededWidth > containerWidth;
  const chartWidth = isScrollable ? neededWidth : containerWidth;
  const stepX = chartWidth / (data.length || 1);
  const barWidth = Math.max(8, Math.min(20, stepX * 0.7));

  // Y-position of the daily average line
  const avgLineY =
    dailyAverage > 0
      ? chartHeight - bottomLabelHeight - (dailyAverage / yMax) * availableBarHeight
      : null;

  return (
    <AppCard variant="elevated" style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.headerRow}>
        <View>
          <AppText variant="headingSm">Daily Spending Activity</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Daily distribution with average benchmark
          </AppText>
        </View>

        {selectedDay ? (
          <View style={[styles.selectedBadge, { backgroundColor: colors.primarySoft }]}>
            <AppText variant="caption" color={colors.primary} weight="600">
              {selectedDay.label} {selectedDay.dayOfWeek}: {formatExpenseAmount(selectedDay.amount)}
            </AppText>
          </View>
        ) : (
          <View style={[styles.avgLegendRow, { backgroundColor: colors.surfaceVariant }]}>
            <View style={[styles.avgLegendLine, { backgroundColor: colors.warning }]} />
            <AppText variant="caption" color={colors.textSecondary}>
              Avg: {formatExpenseAmount(dailyAverage)}
            </AppText>
          </View>
        )}
      </View>

      <ScrollView
        horizontal={isScrollable}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={isScrollable ? { paddingRight: spacing.md } : undefined}
      >
        <Svg width={chartWidth} height={chartHeight}>
          {/* Baseline */}
          <Line
            x1="0"
            y1={chartHeight - bottomLabelHeight}
            x2={chartWidth}
            y2={chartHeight - bottomLabelHeight}
            stroke={colors.border}
            strokeWidth="1"
          />

          {/* Daily Average Benchmark Line */}
          {avgLineY !== null && (
            <Line
              x1="0"
              y1={avgLineY}
              x2={chartWidth}
              y2={avgLineY}
              stroke={colors.warning}
              strokeDasharray="4, 3"
              strokeWidth="1.5"
            />
          )}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight =
              item.amount > 0 ? (item.amount / yMax) * availableBarHeight : 3;
            const x = index * stepX + (stepX - barWidth) / 2;
            const y = chartHeight - bottomLabelHeight - barHeight;
            const isSelected = selectedDay?.dateKey === item.dateKey;
            const isAboveAverage = item.amount > dailyAverage && dailyAverage > 0;

            let barColor: string = colors.primaryLight;
            if (isSelected) {
              barColor = colors.primary;
            } else if (isAboveAverage) {
              barColor = colors.expense;
            } else if (item.amount === 0) {
              barColor = colors.surfaceVariant;
            }

            // Show date label every few days if there are many items to prevent crowding
            const showLabel =
              data.length <= 14 ||
              index === 0 ||
              index === data.length - 1 ||
              index % Math.ceil(data.length / 7) === 0;

            return (
              <G key={item.dateKey}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={3}
                  ry={3}
                  fill={barColor}
                  onPress={() => setSelectedDay(item)}
                />

                {showLabel && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={chartHeight - 6}
                    fontSize="9"
                    fontWeight={isSelected ? '700' : '500'}
                    fill={isSelected ? colors.textPrimary : colors.textSecondary}
                    textAnchor="middle"
                  >
                    {item.label}
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>
      </ScrollView>
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
  avgLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  avgLegendLine: {
    width: 12,
    height: 2,
    marginRight: 4,
  },
});

