/**
 * Unit Test Suite for API Client, Configuration, Error Handling, and Service Modules
 */
import { API_CONFIG } from '../api.config';
import { ApiError, handleAxiosError } from '../apiError';
import { authApi } from '../authApi';
import { expenseApi } from '../expenseApi';
import { categoryApi } from '../categoryApi';
import { budgetApi } from '../budgetApi';
import { reportApi } from '../reportApi';

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
    toBeDefined() {
      if (actual === undefined || actual === null) {
        throw new Error(`Assertion failed: expected value to be defined`);
      }
    },
    toContain(substr: string) {
      if (typeof actual !== 'string' || !actual.includes(substr)) {
        throw new Error(`Assertion failed: expected "${actual}" to contain "${substr}"`);
      }
    },
  };
}

describe('API Infrastructure & Service Abstraction Tests', () => {
  test('1. Base URL configuration is dynamic and non-empty', () => {
    const baseUrl = API_CONFIG.getBaseUrl();
    expect(typeof baseUrl).toBe('string');
    expect(baseUrl.length > 0).toBe(true);
    expect(baseUrl.endsWith('/api')).toBe(true);
  });

  test('2. Mock API mode toggle works properly', () => {
    expect(API_CONFIG.isMockEnabled()).toBe(true);
    API_CONFIG.setMockEnabled(false);
    expect(API_CONFIG.isMockEnabled()).toBe(false);
    API_CONFIG.setMockEnabled(true);
    expect(API_CONFIG.isMockEnabled()).toBe(true);
  });

  test('3. Standardized error handling for Timeout', () => {
    const timeoutError = {
      isAxiosError: true,
      code: 'ECONNABORTED',
      message: 'timeout of 15000ms exceeded',
    };
    const apiErr = handleAxiosError(timeoutError);
    expect(apiErr instanceof ApiError).toBe(true);
    expect(apiErr.isTimeout).toBe(true);
    expect(apiErr.statusCode).toBe(408);
  });

  test('4. Standardized error handling for Network Disconnection', () => {
    const networkError = {
      isAxiosError: true,
      code: 'ERR_NETWORK',
      message: 'Network Error',
    };
    const apiErr = handleAxiosError(networkError);
    expect(apiErr.isNetworkError).toBe(true);
    expect(apiErr.statusCode).toBe(0);
  });

  test('5. Standardized error handling for Backend 400 Bad Request', () => {
    const backendError = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: 'Invalid category specified.' },
      },
    };
    const apiErr = handleAxiosError(backendError);
    expect(apiErr.statusCode).toBe(400);
    expect(apiErr.message).toBe('Invalid category specified.');
  });

  test('6. Standardized error handling for 401 Unauthorized', () => {
    const authError = {
      isAxiosError: true,
      response: {
        status: 401,
        data: {},
      },
    };
    const apiErr = handleAxiosError(authError);
    expect(apiErr.statusCode).toBe(401);
    expect(apiErr.message).toContain('Invalid or expired session');
  });

  test('7. authApi.login() returns authenticated user and token in mock mode', async () => {
    const res = await authApi.login({
      email: 'alex.morgan@example.com',
      password: 'password123',
    });
    expect(res.user.email).toBe('alex.morgan@example.com');
    expect(typeof res.token).toBe('string');
  });

  test('8. expenseApi.getExpenses() returns expense array', async () => {
    const expenses = await expenseApi.getExpenses();
    expect(Array.isArray(expenses)).toBe(true);
    expect(expenses.length > 0).toBe(true);
  });

  test('9. categoryApi.getCategories() returns categories list', async () => {
    const categories = await categoryApi.getCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length > 0).toBe(true);
  });

  test('10. budgetApi.getBudget() returns monthly total and category budgets', async () => {
    const budget = await budgetApi.getBudget();
    expect(typeof budget.monthlyTotal).toBe('number');
    expect(Array.isArray(budget.categoryBudgets)).toBe(true);
  });

  test('11. reportApi.getMonthlyReport() returns report metrics', async () => {
    const report = await reportApi.getMonthlyReport('2026-09');
    expect(report.metrics).toBeDefined();
    expect(typeof report.metrics.totalSpending).toBe('number');
    expect(Array.isArray(report.categoryBreakdown)).toBe(true);
  });
});
