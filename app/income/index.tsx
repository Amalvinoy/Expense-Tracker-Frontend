import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { AppCard } from '@/components/common/AppCard';
import { AmountText } from '@/components/common/AmountText';
import { useIncomeStore } from '@/features/income/store/income.store';
import { useExpenseStore } from '@/store/expense.store';
import { useSettingsStore } from '@/features/settings/store/settings.store';
import {
  calculateFinancialSummary,
  formatMonthYear,
  getMonthExpenses,
} from '@/features/income/utils/income.utils';
import { IncomeFormModal } from '@/features/income/components/IncomeFormModal';
import { MonthlyIncome } from '@/features/income/types/income.types';
import { useAppTheme } from '@/hooks';
import { spacing, radius, shadows } from '@/constants';

export default function IncomeSavingsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { settings } = useSettingsStore();
  const currency = settings.currency.code;

  const {
    selectedYear,
    selectedMonth,
    currentIncome,
    loadIncomeForMonth,
    setSelectedMonth,
  } = useIncomeStore();

  const { expenses, loadExpenses } = useExpenseStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    loadIncomeForMonth(selectedYear, selectedMonth);
    loadExpenses();
  }, [selectedYear, selectedMonth, loadIncomeForMonth, loadExpenses]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadIncomeForMonth(selectedYear, selectedMonth),
        loadExpenses(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedYear, selectedMonth, loadIncomeForMonth, loadExpenses]);

  // Navigate months
  const handlePreviousMonth = () => {
    let prevMonth = selectedMonth - 1;
    let prevYear = selectedYear;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    setSelectedMonth(prevYear, prevMonth);
  };

  const handleNextMonth = () => {
    let nextMonth = selectedMonth + 1;
    let nextYear = selectedYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    setSelectedMonth(nextYear, nextMonth);
  };

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(now.getFullYear(), now.getMonth() + 1);
  };

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return (
      selectedYear === now.getFullYear() &&
      selectedMonth === now.getMonth() + 1
    );
  }, [selectedYear, selectedMonth]);

  // Calculate metrics for current month
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(
      expenses,
      currentIncome,
      selectedYear,
      selectedMonth
    );
  }, [expenses, currentIncome, selectedYear, selectedMonth]);

  const monthExpenses = useMemo(() => {
    return getMonthExpenses(expenses, selectedYear, selectedMonth);
  }, [expenses, selectedYear, selectedMonth]);

  const showBanner = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => setBannerMessage(null), 3500);
  };

  const monthLabel = formatMonthYear(selectedYear, selectedMonth);
  const totalExp = financialSummary.totalExpenses;
  const cashExp = financialSummary.cashExpenses;
  const upiExp = financialSummary.upiExpenses;
  const otherExp = financialSummary.otherExpenses;

  // Percentage calculations for breakdown bars
  const cashPct = totalExp > 0 ? Math.round((cashExp / totalExp) * 100) : 0;
  const upiPct = totalExp > 0 ? Math.round((upiExp / totalExp) * 100) : 0;
  const otherPct = totalExp > 0 ? Math.round((otherExp / totalExp) * 100) : 0;

  return (
    <ScreenContainer scrollable={false} edges={['top', 'bottom']}>
      {/* 1. Header Bar */}
      <View
        style={[
          styles.headerBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.divider },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <AppIcon name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <AppText variant="headingSm" color={colors.textPrimary} style={styles.headerTitle}>
            Income & Savings
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {monthLabel}
          </AppText>
        </View>

        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.headerActionBtn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Record Income"
        >
          <AppIcon name={currentIncome ? 'pencil' : 'plus'} size={18} color="#FFFFFF" />
          <AppText variant="caption" color="#FFFFFF" weight="600" style={{ marginLeft: 4 }}>
            {currentIncome ? 'Edit' : '+ Income'}
          </AppText>
        </Pressable>
      </View>

      {/* 2. Success Banner */}
      {bannerMessage ? (
        <View style={[styles.banner, { backgroundColor: colors.income }]}>
          <AppIcon name="checkmark-circle" size={18} color="#FFFFFF" />
          <AppText variant="bodySm" color="#FFFFFF" weight="600" style={{ flex: 1, marginLeft: 8 }}>
            {bannerMessage}
          </AppText>
        </View>
      ) : null}

      {/* 3. Main Scrollable Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Month Selector Carousel */}
        <View style={[styles.monthSelector, { backgroundColor: colors.surface }]}>
          <Pressable
            onPress={handlePreviousMonth}
            style={[styles.monthNavBtn, { backgroundColor: colors.surfaceVariant }]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Previous Month"
          >
            <AppIcon name="chevron-left" size={20} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.monthLabelContainer}>
            <View style={styles.monthBadge}>
              <AppIcon name="calendar-outline" size={16} color={colors.primary} />
              <AppText variant="headingSm" color={colors.textPrimary} weight="700" style={{ marginLeft: 6 }}>
                {monthLabel}
              </AppText>
            </View>
            {!isCurrentMonth ? (
              <Pressable onPress={handleResetToCurrentMonth} style={styles.currentMonthLink}>
                <AppText variant="caption" color={colors.primary} weight="600">
                  Return to Current Month
                </AppText>
              </Pressable>
            ) : (
              <AppText variant="caption" color={colors.textSecondary}>
                Current Active Month
              </AppText>
            )}
          </View>

          <Pressable
            onPress={handleNextMonth}
            style={[styles.monthNavBtn, { backgroundColor: colors.surfaceVariant }]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Next Month"
          >
            <AppIcon name="chevron-right" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Hero Financial Summary Card */}
        <AppCard variant="elevated" style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <AppText variant="caption" color={colors.textSecondary} weight="600">
              MONTHLY FINANCIAL SUMMARY
            </AppText>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: !financialSummary.hasIncomeRecorded
                    ? `${colors.textSecondary}20`
                    : financialSummary.isDeficit
                    ? colors.expenseSoft
                    : colors.incomeSoft,
                },
              ]}
            >
              <AppIcon
                name={
                  !financialSummary.hasIncomeRecorded
                    ? 'help-circle-outline'
                    : financialSummary.isDeficit
                    ? 'alert-circle-outline'
                    : 'shield-checkmark-outline'
                }
                size={14}
                color={
                  !financialSummary.hasIncomeRecorded
                    ? colors.textSecondary
                    : financialSummary.isDeficit
                    ? colors.expense
                    : colors.income
                }
              />
              <AppText
                variant="caption"
                weight="700"
                color={
                  !financialSummary.hasIncomeRecorded
                    ? colors.textSecondary
                    : financialSummary.isDeficit
                    ? colors.expense
                    : colors.income
                }
                style={{ marginLeft: 4 }}
              >
                {!financialSummary.hasIncomeRecorded
                  ? 'Income Not Set'
                  : financialSummary.isDeficit
                  ? 'Overspending / Deficit'
                  : 'Healthy Savings'}
              </AppText>
            </View>
          </View>

          {/* Primary Metrics Grid */}
          <View style={styles.metricsGrid}>
            {/* Income */}
            <View style={[styles.metricTile, { backgroundColor: colors.surfaceVariant }]}>
              <View style={styles.tileHeader}>
                <AppIcon name="wallet-outline" size={16} color={colors.primary} />
                <AppText variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
                  Monthly Income
                </AppText>
              </View>
              <AmountText
                amount={financialSummary.monthlyIncome}
                currency={currency}
                variant="amountMedium"
                color={colors.textPrimary}
              />
              {currentIncome?.source ? (
                <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
                  {currentIncome.source}
                </AppText>
              ) : null}
            </View>

            {/* Expenses */}
            <View style={[styles.metricTile, { backgroundColor: colors.surfaceVariant }]}>
              <View style={styles.tileHeader}>
                <AppIcon name="cart-outline" size={16} color={colors.warning} />
                <AppText variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
                  Total Expenses
                </AppText>
              </View>
              <AmountText
                amount={financialSummary.totalExpenses}
                currency={currency}
                variant="amountMedium"
                color={colors.textPrimary}
              />
              <AppText variant="caption" color={colors.textSecondary}>
                {monthExpenses.length} expense{monthExpenses.length !== 1 ? 's' : ''}
              </AppText>
            </View>
          </View>

          {/* Net Savings Hero Row */}
          <View
            style={[
              styles.savingsRow,
              {
                backgroundColor: financialSummary.isDeficit
                  ? colors.expenseSoft
                  : colors.incomeSoft,
                borderColor: financialSummary.isDeficit
                  ? colors.expense
                  : colors.income,
              },
            ]}
          >
            <View>
              <AppText
                variant="caption"
                weight="600"
                color={financialSummary.isDeficit ? colors.expense : colors.income}
              >
                {financialSummary.isDeficit ? 'NET DEFICIT' : 'NET SAVINGS'}
              </AppText>
              <AmountText
                amount={Math.abs(financialSummary.savings)}
                currency={currency}
                variant="amountLarge"
                color={financialSummary.isDeficit ? colors.expense : colors.income}
                showSign={financialSummary.isDeficit}
              />
            </View>

            <View style={styles.savingsRateContainer}>
              <AppText
                variant="caption"
                color={financialSummary.isDeficit ? colors.expense : colors.income}
                weight="700"
                style={styles.savingsRateText}
              >
                {financialSummary.hasIncomeRecorded
                  ? `${financialSummary.savingsPercentage > 0 ? '+' : ''}${financialSummary.savingsPercentage.toFixed(1)}%`
                  : 'N/A'}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Savings Rate
              </AppText>
            </View>
          </View>

          {/* Advice / Alert Note */}
          {financialSummary.hasIncomeRecorded && financialSummary.isDeficit ? (
            <View style={[styles.adviceBox, { backgroundColor: colors.expenseSoft }]}>
              <AppIcon name="alert-circle" size={16} color={colors.expense} />
              <AppText variant="caption" color={colors.expense} style={{ flex: 1, marginLeft: 6 }}>
                Expenses exceed your recorded monthly income by ₹{financialSummary.deficitAmount.toLocaleString('en-IN')}. Consider reviewing discretionary spending.
              </AppText>
            </View>
          ) : null}

          {!financialSummary.hasIncomeRecorded ? (
            <View style={[styles.adviceBox, { backgroundColor: colors.surfaceVariant }]}>
              <AppIcon name="information-circle-outline" size={16} color={colors.primary} />
              <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1, marginLeft: 6 }}>
                Record your monthly income for {monthLabel} to unlock savings tracking and rate calculation.
              </AppText>
            </View>
          ) : null}
        </AppCard>

        {/* Monthly Income Detail Card */}
        <AppCard variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleGroup}>
              <View style={[styles.sectionIconCircle, { backgroundColor: colors.primarySoft }]}>
                <AppIcon name="cash" size={18} color={colors.primary} />
              </View>
              <View style={{ marginLeft: spacing.sm }}>
                <AppText variant="headingSm" color={colors.textPrimary}>
                  Monthly Income Record
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {currentIncome ? 'Recorded in database' : 'No income set for this month'}
                </AppText>
              </View>
            </View>

            <Pressable
              onPress={() => setModalVisible(true)}
              style={[
                styles.editRecordBtn,
                {
                  backgroundColor: currentIncome ? colors.surfaceVariant : colors.primary,
                },
              ]}
            >
              <AppText
                variant="caption"
                color={currentIncome ? colors.primary : '#FFFFFF'}
                weight="600"
              >
                {currentIncome ? 'Edit Income' : '+ Set Income'}
              </AppText>
            </Pressable>
          </View>

          {currentIncome ? (
            <View style={[styles.incomeDetailsBox, { backgroundColor: colors.surfaceVariant }]}>
              <View style={styles.detailRow}>
                <AppText variant="bodySm" color={colors.textSecondary}>
                  Amount:
                </AppText>
                <AmountText
                  amount={currentIncome.amount}
                  currency={currency}
                  variant="amountSmall"
                  color={colors.textPrimary}
                />
              </View>

              {currentIncome.source ? (
                <View style={styles.detailRow}>
                  <AppText variant="bodySm" color={colors.textSecondary}>
                    Source:
                  </AppText>
                  <AppText variant="bodySm" color={colors.textPrimary} weight="600">
                    {currentIncome.source}
                  </AppText>
                </View>
              ) : null}

              {currentIncome.note ? (
                <View style={[styles.detailRow, { alignItems: 'flex-start' }]}>
                  <AppText variant="bodySm" color={colors.textSecondary}>
                    Note:
                  </AppText>
                  <AppText variant="bodySm" color={colors.textPrimary} style={{ flex: 1, textAlign: 'right' }}>
                    {currentIncome.note}
                  </AppText>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.noIncomePrompt}>
              <AppText variant="bodySm" color={colors.textSecondary} style={{ textAlign: 'center' }}>
                Tap the button above to record your income for {monthLabel}.
              </AppText>
            </View>
          )}
        </AppCard>

        {/* Payment Method Breakdown Card */}
        <AppCard variant="elevated" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleGroup}>
              <View style={[styles.sectionIconCircle, { backgroundColor: colors.infoSoft }]}>
                <AppIcon name="card-outline" size={18} color={colors.info} />
              </View>
              <View style={{ marginLeft: spacing.sm }}>
                <AppText variant="headingSm" color={colors.textPrimary}>
                  Payment Method Breakdown
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  How your money was spent in {monthLabel}
                </AppText>
              </View>
            </View>
          </View>

          {/* Breakdown Items */}
          <View style={styles.breakdownList}>
            {/* Cash */}
            <View style={[styles.breakdownItem, { backgroundColor: colors.surfaceVariant }]}>
              <View style={styles.breakdownItemHeader}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.smallIconCircle, { backgroundColor: colors.incomeSoft }]}>
                    <AppIcon name="cash-outline" size={16} color={colors.income} />
                  </View>
                  <AppText variant="bodySm" color={colors.textPrimary} weight="600" style={{ marginLeft: 8 }}>
                    Cash Expenses
                  </AppText>
                </View>
                <View style={styles.breakdownRight}>
                  <AmountText
                    amount={cashExp}
                    currency={currency}
                    variant="amountSmall"
                    color={colors.textPrimary}
                  />
                  <AppText variant="caption" color={colors.textSecondary} style={{ marginLeft: 6 }}>
                    ({cashPct}%)
                  </AppText>
                </View>
              </View>
              {/* Progress bar */}
              <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: colors.income, width: `${cashPct}%` },
                  ]}
                />
              </View>
            </View>

            {/* UPI */}
            <View style={[styles.breakdownItem, { backgroundColor: colors.surfaceVariant }]}>
              <View style={styles.breakdownItemHeader}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.smallIconCircle, { backgroundColor: colors.primarySoft }]}>
                    <AppIcon name="flash-outline" size={16} color={colors.primary} />
                  </View>
                  <AppText variant="bodySm" color={colors.textPrimary} weight="600" style={{ marginLeft: 8 }}>
                    UPI Expenses
                  </AppText>
                </View>
                <View style={styles.breakdownRight}>
                  <AmountText
                    amount={upiExp}
                    currency={currency}
                    variant="amountSmall"
                    color={colors.textPrimary}
                  />
                  <AppText variant="caption" color={colors.textSecondary} style={{ marginLeft: 6 }}>
                    ({upiPct}%)
                  </AppText>
                </View>
              </View>
              {/* Progress bar */}
              <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: colors.primary, width: `${upiPct}%` },
                  ]}
                />
              </View>
            </View>

            {/* Other */}
            <View style={[styles.breakdownItem, { backgroundColor: colors.surfaceVariant }]}>
              <View style={styles.breakdownItemHeader}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.smallIconCircle, { backgroundColor: colors.warningSoft }]}>
                    <AppIcon name="wallet-outline" size={16} color={colors.warning} />
                  </View>
                  <AppText variant="bodySm" color={colors.textPrimary} weight="600" style={{ marginLeft: 8 }}>
                    Other Expenses (Cards, NetBanking)
                  </AppText>
                </View>
                <View style={styles.breakdownRight}>
                  <AmountText
                    amount={otherExp}
                    currency={currency}
                    variant="amountSmall"
                    color={colors.textPrimary}
                  />
                  <AppText variant="caption" color={colors.textSecondary} style={{ marginLeft: 6 }}>
                    ({otherPct}%)
                  </AppText>
                </View>
              </View>
              {/* Progress bar */}
              <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: colors.warning, width: `${otherPct}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </AppCard>

        {/* Bottom spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Income Form Modal */}
      <IncomeFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        year={selectedYear}
        month={selectedMonth}
        initialIncome={currentIncome}
        onSuccess={(saved: MonthlyIncome) => {
          showBanner(
            `Income of ₹${saved.amount.toLocaleString('en-IN')} saved for ${formatMonthYear(saved.year, saved.month)}.`
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: spacing.xs,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadows.subtle,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabelContainer: {
    alignItems: 'center',
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentMonthLink: {
    marginTop: 3,
  },
  heroCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricTile: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: 4,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  savingsRateContainer: {
    alignItems: 'flex-end',
  },
  savingsRateText: {
    fontSize: 18,
  },
  adviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  sectionCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editRecordBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  incomeDetailsBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  noIncomePrompt: {
    paddingVertical: spacing.md,
  },
  breakdownList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  breakdownItem: {
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: 8,
  },
  breakdownItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
