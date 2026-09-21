import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { AppIcon } from '@/components/common/AppIcon';
import { LoadingView } from '@/components/feedback/LoadingView';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import {
  ExpenseCard,
  ExpenseSearchBar,
  ExpenseFilterBar,
  ExpenseSortModal,
  DateGroupHeader,
  useExpenseHistory,
  formatExpenseAmount,
  Expense,
} from '@/features/expenses';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing, radius } from '@/constants';

interface HistoryFlatListItem {
  id: string;
  isHeader: boolean;
  headerData?: {
    displayDate: string;
    totalAmount: number;
  };
  expense?: Expense;
}

export default function ExpenseHistoryScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const {
    groupedExpenses,
    totalCount,
    totalFilteredAmount,
    isLoading,
    isRefreshing,
    error,
    searchQuery,
    setSearchQuery,
    datePreset,
    setDatePreset,
    selectedCategoryId,
    setSelectedCategoryId,
    sortBy,
    setSortBy,
    sortModalVisible,
    setSortModalVisible,
    resetFilters,
    refresh,
  } = useExpenseHistory();

  // Flatten grouped expenses for maximum FlatList virtualization efficiency
  const flatListData = useMemo<HistoryFlatListItem[]>(() => {
    const items: HistoryFlatListItem[] = [];

    groupedExpenses.forEach((group) => {
      // 1. Section Header Item
      items.push({
        id: `header_${group.dateKey}`,
        isHeader: true,
        headerData: {
          displayDate: group.displayDate,
          totalAmount: group.totalAmount,
        },
      });

      // 2. Individual Expense Items
      group.expenses.forEach((expense) => {
        items.push({
          id: `exp_${expense.id}`,
          isHeader: false,
          expense,
        });
      });
    });

    return items;
  }, [groupedExpenses]);

  const handleItemPress = (expense: Expense) => {
    router.push(`/expense/${expense.id}` as any);
  };

  const renderItem = ({ item }: { item: HistoryFlatListItem }) => {
    if (item.isHeader && item.headerData) {
      return (
        <DateGroupHeader
          displayDate={item.headerData.displayDate}
          totalAmount={item.headerData.totalAmount}
        />
      );
    }

    if (item.expense) {
      return (
        <ExpenseCard
          expense={item.expense}
          onPress={handleItemPress}
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top App Bar */}
      <View
        style={[
          styles.navBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.divider },
        ]}
      >
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/');
          }}
          style={styles.navButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="chevron-left" size={28} color={colors.textPrimary} />
        </Pressable>

        <AppText variant="headingSm" style={styles.navTitle}>
          Expense History
        </AppText>

        <Pressable
          onPress={() => router.push('/expense/add')}
          style={[styles.addButton, { backgroundColor: colors.primarySoft }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Add new expense"
        >
          <AppIcon name="plus" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {/* Main FlatList */}
      <FlatList
        data={flatListData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={refresh}
        // Efficient FlatList performance properties
        initialNumToRender={14}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={
          <View style={styles.listHeaderContainer}>
            {/* 1. Search Bar */}
            <ExpenseSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />

            {/* 2. Filters & Sort Bar */}
            <ExpenseFilterBar
              selectedDatePreset={datePreset}
              onSelectDatePreset={setDatePreset}
              selectedCategoryId={selectedCategoryId}
              onSelectCategoryId={setSelectedCategoryId}
              onOpenSortModal={() => setSortModalVisible(true)}
            />

            {/* 3. Filter Summary Banner */}
            {!isLoading && totalCount > 0 && (
              <View
                style={[
                  styles.summaryBar,
                  { backgroundColor: colors.surfaceVariant },
                ]}
              >
                <AppText variant="caption" color={colors.textSecondary}>
                  Showing <AppText variant="caption" weight="600" color={colors.textPrimary}>{totalCount}</AppText> expenses
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  Total: <AppText variant="caption" weight="600" color={colors.expense}>{formatExpenseAmount(totalFilteredAmount)}</AppText>
                </AppText>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingView fullscreen message="Loading transactions history..." />
          ) : error ? (
            <ErrorState
              title="Failed to Load Expenses"
              message={error}
              retryTitle="Try Again"
              onRetry={refresh}
            />
          ) : (
            <EmptyState
              icon="receipt-text-outline"
              title="No Expenses Found"
              description="No transactions match your current search or filter criteria. Try resetting your filters."
              actionTitle="Reset All Filters"
              onActionPress={resetFilters}
              style={{ marginTop: spacing.xl }}
            />
          )
        }
      />

      {/* Sort Selection Modal */}
      <ExpenseSortModal
        visible={sortModalVisible}
        selectedSort={sortBy}
        onSelectSort={setSortBy}
        onClose={() => setSortModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
  addButton: {
    padding: spacing.xs,
    borderRadius: radius.full,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  listHeaderContainer: {
    paddingTop: spacing.md,
    marginBottom: spacing.xs,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
});

