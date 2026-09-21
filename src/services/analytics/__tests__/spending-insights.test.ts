/**
 * Unit Test Suite for Spending Insights Service
 * Verifies purely deterministic calculation algorithms
 */
import { spendingInsightsService } from '../spending-insights.service';
import { Expense } from '@/features/expenses/types/expense.types';

// Standalone typed assertion helpers
function describe(_name: string, fn: () => void) {
  fn();
}
function test(_name: string, fn: () => void) {
  fn();
}
function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Assertion failed: expected ${expected} but got ${actual}`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Assertion failed: expected null but got ${actual}`);
      }
    },
    toContain(substr: string) {
      if (typeof actual !== 'string' || !actual.includes(substr)) {
        throw new Error(`Assertion failed: expected "${actual}" to contain "${substr}"`);
      }
    },
  };
}

describe('SpendingInsightsService Deterministic Calculations', () => {
  const mockExpenses: Expense[] = [
    {
      id: 'exp1',
      userId: 'u1',
      amount: 1240,
      categoryId: 'cat_food',
      categoryName: 'Food & Dining',
      categoryIcon: 'silverware-fork-knife',
      paymentMethod: 'UPI',
      date: '2026-09-05T12:00:00.000Z',
      createdAt: '2026-09-05T12:00:00.000Z',
      updatedAt: '2026-09-05T12:00:00.000Z',
    },
    {
      id: 'exp2',
      userId: 'u1',
      amount: 600,
      categoryId: 'cat_transport',
      categoryName: 'Transport',
      categoryIcon: 'bus',
      paymentMethod: 'Credit Card',
      date: '2026-09-08T09:30:00.000Z',
      createdAt: '2026-09-08T09:30:00.000Z',
      updatedAt: '2026-09-08T09:30:00.000Z',
    },
    {
      id: 'exp3',
      userId: 'u1',
      amount: 2400,
      categoryId: 'cat_shopping',
      categoryName: 'Shopping',
      categoryIcon: 'shopping',
      paymentMethod: 'UPI',
      date: '2026-09-12T15:00:00.000Z',
      createdAt: '2026-09-12T15:00:00.000Z',
      updatedAt: '2026-09-12T15:00:00.000Z',
    },
    {
      id: 'exp4',
      userId: 'u1',
      amount: 300,
      categoryId: 'cat_food',
      categoryName: 'Food & Dining',
      categoryIcon: 'silverware-fork-knife',
      paymentMethod: 'Cash',
      date: '2026-09-12T18:00:00.000Z',
      createdAt: '2026-09-12T18:00:00.000Z',
      updatedAt: '2026-09-12T18:00:00.000Z',
    },
    // Previous month (August 2026) expense for comparison
    {
      id: 'exp_prev1',
      userId: 'u1',
      amount: 3690,
      categoryId: 'cat_general',
      categoryName: 'General',
      categoryIcon: 'wallet',
      paymentMethod: 'UPI',
      date: '2026-08-10T12:00:00.000Z',
      createdAt: '2026-08-10T12:00:00.000Z',
      updatedAt: '2026-08-10T12:00:00.000Z',
    },
  ];

  const currentMonthExpenses = mockExpenses.filter((e) => e.date.startsWith('2026-09'));
  const totalMonthSpent = currentMonthExpenses.reduce((s, e) => s + e.amount, 0); // 1240 + 600 + 2400 + 300 = 4540

  test('1. Highest spending category', () => {
    const insight = spendingInsightsService.calculateHighestCategory(
      currentMonthExpenses,
      totalMonthSpent,
      '₹'
    );
    expect(insight !== null).toBe(true);
    expect(insight?.categoryName).toBe('Shopping'); // Shopping has 2400 vs Food has 1540
    expect(insight?.message).toContain('Shopping');
  });

  test('2. Highest spending day', () => {
    const insight = spendingInsightsService.calculateHighestDay(
      currentMonthExpenses,
      '₹'
    );
    expect(insight !== null).toBe(true);
    expect(insight?.dateKey).toBe('2026-09-12'); // 2400 + 300 = 2700 on Sep 12
    expect(insight?.highlightValue).toBe('₹2,700');
  });

  test('3. Average daily spending', () => {
    const refDate = new Date(2026, 8, 19); // Sep 19 -> 19 elapsed days
    const insight = spendingInsightsService.calculateDailyAverage(
      totalMonthSpent,
      refDate,
      '₹'
    );
    expect(insight !== null).toBe(true);
    const expectedAvg = Math.round(4540 / 19); // 239
    expect(insight?.highlightValue).toBe(`₹${expectedAvg}`);
    expect(insight?.message).toContain('average daily spending is');
  });

  test('4. Period comparison (current vs previous month)', () => {
    // Current up to day 19 is 4540; Previous August up to day 19 is 3690
    // Diff = +850
    const insight = spendingInsightsService.calculatePeriodComparison(
      mockExpenses,
      '2026-09',
      '2026-08',
      19,
      '₹'
    );
    expect(insight !== null).toBe(true);
    expect(insight?.highlightValue).toBe('+₹850');
    expect(insight?.message).toContain('You spent ₹850 more this month than last month.');
  });

  test('5. Budget usage calculation', () => {
    const refDate = new Date(2026, 8, 19);
    const insight = spendingInsightsService.calculateBudgetUsage(
      4540,
      10000,
      refDate,
      '₹'
    );
    expect(insight !== null).toBe(true);
    expect(insight?.highlightValue).toBe('45%');
    expect(insight?.message).toContain("You've used 45% of your ₹10,000 monthly budget.");
  });

  test('6. Unusual high spending day spike detection', () => {
    const dailyAvg = 239;
    const insight = spendingInsightsService.calculateUnusualSpikes(
      currentMonthExpenses,
      dailyAvg,
      '₹'
    );
    // Sep 12 spent 2700, which is > 2.2 * 239 (525.8)
    expect(insight !== null).toBe(true);
    expect(insight?.dateKey).toBe('2026-09-12');
    expect(insight?.message).toContain('Unusual spike detected on');
  });

  test('7. Full report generation', () => {
    const report = spendingInsightsService.generateAllInsights(
      mockExpenses,
      10000,
      [],
      '₹',
      new Date(2026, 8, 19)
    );
    expect(report.insights.length).toBe(6);
  });
});
