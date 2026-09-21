import { Platform } from 'react-native';

/**
 * Dynamic API & Environment Configuration
 * Avoids hardcoding URLs across the codebase and handles platform differences
 * (Android emulator 10.0.2.2 vs iOS/Web localhost).
 */

let mockApiOverride: boolean | null = null;

export const API_CONFIG = {
  timeoutMs: 15000,
  apiVersion: 'v1',

  /**
   * Dynamically resolves the API Base URL based on environment and platform.
   */
  getBaseUrl(): string {
    if (process.env.EXPO_PUBLIC_API_URL) {
      return process.env.EXPO_PUBLIC_API_URL;
    }

    // Android emulator cannot access host machine via "localhost"; it maps to 10.0.2.2
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/api';
    }

    // iOS Simulator, macOS, and Web
    return 'http://localhost:5000/api';
  },

  /**
   * Check whether mock API mode is active.
   * Defaults to true so the app runs smoothly before the backend is deployed.
   */
  isMockEnabled(): boolean {
    if (mockApiOverride !== null) {
      return mockApiOverride;
    }
    // Real API mode by default. Only enabled if explicitly set to 'true'.
    return process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';
  },

  /**
   * Programmatically enable or disable mock API mode (useful for integration tests/switching).
   */
  setMockEnabled(enabled: boolean): void {
    mockApiOverride = enabled;
  },
};
