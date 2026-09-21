import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { EmptyState } from '@/components/feedback/EmptyState';
import {
  useReportsData,
  ReportTimeFilterBar,
  ReportStatCard,
  MonthlySpendingBarChart,
  DailySpendingChart,
  CategoryBreakdownDonut,
  PaymentMethodBreakdownCard,
} from '@/features/reports';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';

export default function ReportsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const {
    reportData,
    timeRange,
    setTimeRange,
    customRange,
    setCustomRange,
  } = useReportsData();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const { metrics } = reportData;
  const hasExpenses = reportData.filteredExpensesCount > 0;

  return (
    <ScreenContainer
      scrollable
      edges={['top', 'bottom']}
      header={
        <View
          style={[
            styles.navBar,
            { backgroundColor: colors.surface, borderBottomColor: colors.divider },
          ]}
        >
          <Pressable
            onPress={handleBack}
            style={styles.navButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <AppIcon name="chevron-left" size={28} color={colors.textPrimary} />
          </Pressable>

          <AppText variant="headingSm" style={styles.navTitle}>
            Spending Reports
          </AppText>

          <Pressable
            onPress={() => router.push('/expense/history')}
            style={[styles.historyButton, { backgroundColor: colors.primarySoft }]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="View all history"
          >
            <AppIcon name="receipt-text-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
      }
    >
      {/* 1. Time Horizon Filter Bar */}
      <ReportTimeFilterBar
        selectedRange={timeRange}
        onSelectRange={setTimeRange}
        customRange={customRange}
        onUpdateCustomRange={setCustomRange}
        dateRangeLabel={reportData.dateRangeLabel}
      />

      {hasExpenses ? (
        <>
          {/* 2. Primary KPI Stats Row */}
          <View style={styles.kpiRow}>
            <View style={{ flex: 1, marginRight: spacing.xs }}>
              <ReportStatCard
                title="Total Spending"
                amount={metrics.totalSpending}
                subtext={`${metrics.totalTransactions} transactions`}
                icon="cash-multiple"
                iconColor={colors.primary}
                iconBg={colors.primarySoft}
                highlight
              />
            </View>

            <View style={{ flex: 1, marginLeft: spacing.xs }}>
              <ReportStatCard
                title="Daily Average"
                amount={metrics.dailyAverage}
                subtext={`Across ${metrics.totalDaysInPeriod} days`}
                icon="chart-line"
                iconColor={colors.income}
                iconBg={colors.incomeSoft}
              />
            </View>
          </View>

          {/* 3. Deep-Dive Highlights Row */}
          <View style={styles.kpiRow}>
            <View style={{ flex: 1, marginRight: spacing.xs }}>
              <ReportStatCard
                title="Highest Day"
                amount={metrics.highestSpendingDay?.amount}
                subtext={metrics.highestSpendingDay?.displayDate || 'No expenses'}
                icon="calendar-alert"
                iconColor={colors.expense}
                iconBg={colors.expenseSoft}
              />
            </View>

            <View style={{ flex: 1, marginLeft: spacing.xs }}>
              <ReportStatCard
                title="Top Category"
                valueText={metrics.highestSpendingCategory?.name || '—'}
                subtext={
                  metrics.highestSpendingCategory
                    ? `${metrics.highestSpendingCategory.percentage}% of spending`
                    : 'No expenses'
                }
                icon={metrics.highestSpendingCategory?.icon || 'shape-outline'}
                iconColor={metrics.highestSpendingCategory?.color || colors.investment}
                iconBg={colors.investmentSoft}
              />
            </View>
          </View>

          {/* 4. Monthly Spending Comparison Chart */}
          <MonthlySpendingBarChart data={reportData.monthlySpending} />

          {/* 5. Daily Spending Activity Chart */}
          <DailySpendingChart
            data={reportData.dailySpending}
            dailyAverage={metrics.dailyAverage}
          />

          {/* 6. Category Breakdown with Donut & List */}
          <CategoryBreakdownDonut
            categories={reportData.categoryBreakdown}
            totalSpending={metrics.totalSpending}
          />

          {/* 7. Payment Channels Breakdown */}
          <PaymentMethodBreakdownCard
            methods={reportData.paymentMethodBreakdown}
          />
        </>
      ) : (
        <EmptyState
          icon="chart-donut"
          title="No Expenses in this Period"
          description="There are no recorded expenses matching your selected time horizon. Change your filter range or record a new transaction to view insights."
          actionTitle="Log New Expense"
          onActionPress={() => router.push('/expense/add')}
          style={{ marginTop: spacing.xl, marginBottom: spacing.xxl }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  navButton: {
    padding: spacing.xxs,
  },
  navTitle: {
    fontWeight: '700',
  },
  historyButton: {
    padding: spacing.xs,
    borderRadius: radius.full,
  },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
});

