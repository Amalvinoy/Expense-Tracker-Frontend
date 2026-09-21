import { DashboardData } from '../types/dashboard.types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const initialMockDashboardData: DashboardData = {
  summary: {
    todaySpending: 450,
    monthlySpending: 12850,
    monthlyBudget: 20000,
    remainingBudget: 7150,
    budgetProgressPercentage: 64.25, // (12850 / 20000) * 100
    currency: 'INR',
  },
  recentExpenses: [
    {
      id: 'exp_001',
      title: 'Healthy Lunch & Juice',
      amount: 180,
      currency: 'INR',
      category: 'Food & Dining',
      paymentMethod: 'UPI',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_002',
      title: 'Metro Transit Fare',
      amount: 70,
      currency: 'INR',
      category: 'Transportation',
      paymentMethod: 'Cash',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_003',
      title: 'Weekend Groceries & Snacks',
      amount: 200,
      currency: 'INR',
      category: 'Shopping',
      paymentMethod: 'Debit Card',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'exp_004',
      title: 'High-speed Fiber Internet',
      amount: 999,
      currency: 'INR',
      category: 'Housing & Utilities',
      paymentMethod: 'Bank Transfer',
      date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'exp_005',
      title: 'Pharmacy & Wellness',
      amount: 350,
      currency: 'INR',
      category: 'Healthcare',
      paymentMethod: 'Credit Card',
      date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    },
  ],
  categorySpending: [
    {
      category: 'Food & Dining',
      amount: 4620,
      percentage: 36.0,
      transactionCount: 22,
    },
    {
      category: 'Housing & Utilities',
      amount: 3400,
      percentage: 26.5,
      transactionCount: 4,
    },
    {
      category: 'Shopping',
      amount: 2580,
      percentage: 20.0,
      transactionCount: 9,
    },
    {
      category: 'Transportation',
      amount: 1450,
      percentage: 11.3,
      transactionCount: 15,
    },
    {
      category: 'Healthcare',
      amount: 800,
      percentage: 6.2,
      transactionCount: 3,
    },
  ],
};

export const mockDashboardService = {
  /**
   * Fetch dashboard financial summary and transactions
   */
  async getDashboardData(simulateError: boolean = false): Promise<DashboardData> {
    await delay(600);

    if (simulateError) {
      throw new Error('Failed to load financial dashboard. Network unavailable.');
    }

    return JSON.parse(JSON.stringify(initialMockDashboardData));
  },

  /**
   * Get an empty state version for testing
   */
  async getEmptyDashboardData(): Promise<DashboardData> {
    await delay(400);

    return {
      summary: {
        todaySpending: 0,
        monthlySpending: 0,
        monthlyBudget: 20000,
        remainingBudget: 20000,
        budgetProgressPercentage: 0,
        currency: 'INR',
      },
      recentExpenses: [],
      categorySpending: [],
    };
  },
};
