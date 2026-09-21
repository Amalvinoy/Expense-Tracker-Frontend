import React, { useState, useEffect } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  LoadingView,
  EmptyState,
  ErrorState,
  AppButton,
} from '@/components';
import {
  DashboardHeader,
  BudgetSummaryCard,
  RecentExpensesList,
  SpendingByCategoryCard,
  QuickAddButton,
  SpendingInsightsCard,
  DashboardLendingCard,
  DashboardIncomeSavingsCard,
} from '@/features/dashboard';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { useAuthStore } from '@/store/auth.store';
import { useExpenseStore } from '@/store/expense.store';
import { useBudgetStore } from '@/features/budget/store/budget.store';
import { useLendingStore } from '@/features/lending/store/lending.store';
import { useIncomeStore } from '@/features/income/store/income.store';
import { calculateFinancialSummary } from '@/features/income/utils/income.utils';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import { spendingInsightsService } from '@/services/analytics';
import {
  useNotificationChecker,
  useNotificationStore,
  NotificationCenterModal,
} from '@/features/notifications';
import { spacing, radius } from '@/constants';
import { useAppTheme } from '@/hooks';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    greeting,
    currentDateFormatted,
    budgetHealth,
    isEmpty,
    refresh,
    retry,
  } = useDashboardData();

  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  // Background notification evaluator (budget alerts, monthly summaries, reminder sync)
  useNotificationChecker();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  // Lending data store
  const { summary: lendingSummary, lendings, loadLendings } = useLendingStore();

  // Income data store
  const { currentIncome, loadIncomeForMonth } = useIncomeStore();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Redirect to login if user is unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load lending & income when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadLendings();
      loadIncomeForMonth(currentYear, currentMonth);
    }
  }, [isAuthenticated, loadLendings, loadIncomeForMonth, currentYear, currentMonth]);

  // Financial data stores for deterministic spending insights
  const { expenses } = useExpenseStore();
  const { monthlyTotalBudget, categoryBudgets } = useBudgetStore();
  const { settings } = useSettingsStore();

  const insightsReport = React.useMemo(() => {
    return spendingInsightsService.generateAllInsights(
      expenses,
      monthlyTotalBudget,
      categoryBudgets,
      settings.currency.symbol
    );
  }, [expenses, monthlyTotalBudget, categoryBudgets, settings.currency.symbol]);

  const incomeSummary = React.useMemo(() => {
    return calculateFinancialSummary(
      expenses,
      currentIncome,
      currentYear,
      currentMonth
    );
  }, [expenses, currentIncome, currentYear, currentMonth]);

  const handleQuickAdd = () => {
    router.push('/expense/add');
  };

  const handleRefreshAll = async () => {
    await Promise.all([
      refresh(),
      loadLendings(),
      loadIncomeForMonth(currentYear, currentMonth),
    ]);
  };

  if (authLoading) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <LoadingView fullscreen message="Restoring session..." />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ScreenContainer
      scrollable
      edges={['top', 'bottom']}
      scrollViewProps={{
        refreshControl: (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshAll}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        ),
      }}
      footer={
        !isLoading && !error ? (
          <View style={styles.floatingFooter}>
            <QuickAddButton onPress={handleQuickAdd} style={styles.quickAddBtn} />
          </View>
        ) : undefined
      }
    >
      {/* Top Application Navigation Bar (Strict Order: Dashboard, History, Lending, Budget, Reports, Settings) */}
      <View style={[styles.viewSelectorWrapper, { backgroundColor: colors.surfaceVariant }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.viewSelectorScroll}
        >
          {/* 1. Dashboard */}
          <AppButton
            title="Dashboard"
            variant="primary"
            size="sm"
            style={styles.viewSelectorBtn}
          />
          {/* 2. History */}
          <AppButton
            title="History"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/expense/history')}
            style={styles.viewSelectorBtn}
          />
          {/* 3. Lending (Position 3, immediately after History) */}
          <AppButton
            title="Lending"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/lending' as any)}
            style={styles.viewSelectorBtn}
          />
          {/* 4. Budget */}
          <AppButton
            title="Budget"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/budget' as any)}
            style={styles.viewSelectorBtn}
          />
          {/* 5. Reports */}
          <AppButton
            title="Reports"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/reports' as any)}
            style={styles.viewSelectorBtn}
          />
          {/* 6. Settings */}
          <AppButton
            title="Settings"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/settings' as any)}
            style={styles.viewSelectorBtn}
          />
        </ScrollView>
      </View>

      {/* Main Dashboard Screen */}
      <View style={styles.dashboardContainer}>
        {/* Header Section: Greeting & Date */}
        <DashboardHeader
          greeting={greeting}
          date={currentDateFormatted}
          userName={user?.name}
          unreadNotificationsCount={unreadCount}
          onNotificationPress={() => setNotificationModalVisible(true)}
          onProfilePress={() => router.push('/settings' as any)}
        />

        {/* 1. Loading State */}
        {isLoading && !isRefreshing && (
          <LoadingView
            fullscreen
            message="Gathering your daily and monthly financial insights..."
            style={[styles.stateContainer, { backgroundColor: colors.surface }]}
          />
        )}

        {/* 2. Error State */}
        {!isLoading && error && (
          <ErrorState
            title="Dashboard Unavailable"
            message={error}
            retryTitle="Try Again"
            onRetry={retry}
            style={[styles.stateContainer, { backgroundColor: colors.surface }]}
          />
        )}

        {/* 3. Empty State (No recorded expenses) */}
        {!isLoading && !error && isEmpty && (
          <EmptyState
            icon="wallet-outline"
            title="No Expenses Recorded"
            description="Start recording your daily expenses to see smart analytics and budget tracking."
            actionTitle="Add First Expense"
            onActionPress={handleQuickAdd}
            style={[styles.stateContainer, { backgroundColor: colors.surface }]}
          />
        )}

        {/* 4. Loaded State with Complete Financial Metrics */}
        {!isLoading && !error && data && !isEmpty && (
          <>
            {/* Budget Summary Card (reflects current month real budget) */}
            <BudgetSummaryCard summary={data.summary} health={budgetHealth} />

            {/* Lending Summary Card */}
            <DashboardLendingCard
              summary={lendingSummary}
              totalRecords={lendings.length}
              onViewLending={() => router.push('/lending' as any)}
              currency={settings.currency.code}
            />

            {/* Income & Savings Summary Card */}
            <DashboardIncomeSavingsCard
              summary={incomeSummary}
              onViewDetails={() => router.push('/income' as any)}
              currency={settings.currency.code}
            />

            {/* Spending Insights Section */}
            <SpendingInsightsCard
              report={insightsReport}
              currencySymbol={settings.currency.symbol}
            />

            {/* Recent Expenses List */}
            <RecentExpensesList
              expenses={data.recentExpenses}
              currency={data.summary.currency}
              onSeeAllPress={() => router.push('/expense/history')}
              onItemPress={(item: any) => router.push(`/expense/${item.id}` as any)}
            />

            {/* Spending by Category Card */}
            <SpendingByCategoryCard
              categories={data.categorySpending}
              currency={data.summary.currency}
            />
          </>
        )}
      </View>

      {/* In-App Notification Center Drawer / Modal */}
      <NotificationCenterModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  viewSelectorWrapper: {
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  viewSelectorScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
    gap: spacing.xs,
  },
  viewSelectorBtn: {
    flexShrink: 0,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  dashboardContainer: {
    paddingBottom: spacing.xxl,
  },
  stateContainer: {
    minHeight: 320,
    borderRadius: radius.lg,
    marginVertical: spacing.md,
  },
  floatingFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  quickAddBtn: {
    width: '100%',
  },
});
