import * as SecureStore from 'expo-secure-store';
import { ISecureStorageService } from './storage.types';

/**
 * Valid key regex for Expo SecureStore: alphanumeric, '.', '-', '_'
 */
const SECURE_KEY_REGEX = /^[a-zA-Z0-9._-]+$/;

/**
 * In-memory fallback cache when SecureStore is not natively supported (e.g., Web/headless tests)
 */
const memoryFallback = new Map<string, string>();

/**
 * SecureStore abstraction for sensitive application data such as authentication tokens.
 * NEVER store passwords or plaintext credentials.
 */
class SecureStorageService implements ISecureStorageService {
  private isAvailableCached: boolean | null = null;

  /**
   * Check if hardware-backed secure storage is available on this device/runtime.
   */
  async isAvailable(): Promise<boolean> {
    if (this.isAvailableCached !== null) {
      return this.isAvailableCached;
    }
    try {
      const available = await SecureStore.isAvailableAsync();
      this.isAvailableCached = available;
      return available;
    } catch {
      this.isAvailableCached = false;
      return false;
    }
  }

  /**
   * Validate and sanitize the secure store key.
   */
  private sanitizeKey(key: string): string {
    if (SECURE_KEY_REGEX.test(key)) {
      return key;
    }
    // Replace disallowed characters with underscore
    const sanitized = key.replace(/[^a-zA-Z0-9._-]/g, '_');
    console.warn(`[SecureStorage] Key "${key}" contained invalid characters and was sanitized to "${sanitized}".`);
    return sanitized;
  }

  /**
   * Store a sensitive value securely.
   * If value is an object, it is serialized to JSON string.
   */
  async setItem<T = string>(key: string, value: T): Promise<boolean> {
    const validKey = this.sanitizeKey(key);

    // Safeguard against accidentally passing a password
    if (typeof value === 'object' && value !== null) {
      const stringified = JSON.stringify(value).toLowerCase();
      if (stringified.includes('"password"') || stringified.includes('"confirmPassword"')) {
        console.error('[SecureStorage] Security policy violation: Storing passwords is strictly prohibited.');
        return false;
      }
    }

    const payload = typeof value === 'string' ? value : JSON.stringify(value);

    try {
      const available = await this.isAvailable();
      if (available) {
        await SecureStore.setItemAsync(validKey, payload);
      } else {
        memoryFallback.set(validKey, payload);
      }
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Failed to set secure item for key "${validKey}":`, error);
      // Fallback to memory so app stays functional in sandboxed/mock runtimes
      memoryFallback.set(validKey, payload);
      return false;
    }
  }

  /**
   * Retrieve a sensitive value from secure storage.
   * Gracefully parses JSON if deserialization is expected, or returns string.
   */
  async getItem<T = string>(key: string, fallback?: T): Promise<T | null> {
    const validKey = this.sanitizeKey(key);

    try {
      let raw: string | null = null;
      const available = await this.isAvailable();

      if (available) {
        raw = await SecureStore.getItemAsync(validKey);
      } else {
        raw = memoryFallback.get(validKey) || null;
      }

      if (raw === null) {
        return fallback !== undefined ? fallback : null;
      }

      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch (error) {
      console.error(`[SecureStorage] Failed to read secure item for key "${validKey}":`, error);
      const fallbackValue = memoryFallback.get(validKey);
      if (fallbackValue) {
        try {
          return JSON.parse(fallbackValue) as T;
        } catch {
          return fallbackValue as unknown as T;
        }
      }
      return fallback !== undefined ? fallback : null;
    }
  }

  /**
   * Delete an item from secure storage.
   */
  async deleteItem(key: string): Promise<boolean> {
    const validKey = this.sanitizeKey(key);
    try {
      memoryFallback.delete(validKey);
      const available = await this.isAvailable();
      if (available) {
        await SecureStore.deleteItemAsync(validKey);
      }
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Failed to delete secure item for key "${validKey}":`, error);
      return false;
    }
  }

  /**
   * Alias for deleteItem for consistent interface.
   */
  async removeItem(key: string): Promise<boolean> {
    return this.deleteItem(key);
  }
}

export const secureStorageService = new SecureStorageService();
