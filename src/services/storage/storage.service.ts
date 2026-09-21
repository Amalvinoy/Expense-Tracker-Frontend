import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageService } from './storage.types';

/**
 * Robust, type-safe wrapper for AsyncStorage.
 * Handles serialization, deserialization, corrupted data recovery, and graceful fallbacks.
 */
class StorageService implements IStorageService {
  /**
   * Serialize any JavaScript value into a valid string.
   * Protects against undefined, functions, and circular references.
   */
  private serialize<T>(value: T): string {
    if (value === undefined) {
      return 'null';
    }
    if (typeof value === 'string') {
      return value;
    }
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error('[StorageService] Serialization failed:', error);
      throw new Error('Failed to serialize value for storage');
    }
  }

  /**
   * Safely deserialize a stored string.
   * If parsing fails due to data corruption or schema changes, returns the fallback value.
   */
  private deserialize<T>(raw: string | null, fallback?: T): T | null {
    if (raw === null || raw === undefined) {
      return fallback !== undefined ? fallback : null;
    }

    // Try parsing as JSON first
    try {
      return JSON.parse(raw) as T;
    } catch (parseError) {
      // If it's a raw unquoted string, return as string if that matches expected type
      if (typeof raw === 'string') {
        // Test if raw looks like corrupted JSON (starts with { or [ but failed to parse)
        const trimmed = raw.trim();
        if ((trimmed.startsWith('{') && !trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && !trimmed.endsWith(']'))) {
          console.warn('[StorageService] Detected corrupted JSON data in storage. Falling back to default.', {
            raw: raw.substring(0, 80),
            error: parseError,
          });
          return fallback !== undefined ? fallback : null;
        }

        return raw as unknown as T;
      }

      console.warn('[StorageService] Unexpected deserialization error. Returning fallback.', parseError);
      return fallback !== undefined ? fallback : null;
    }
  }

  /**
   * Retrieve and deserialize an item from storage.
   * Returns fallback (or null) if the key does not exist or if data is corrupted.
   */
  async getItem<T>(key: string, fallback?: T): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) {
        return fallback !== undefined ? fallback : null;
      }
      return this.deserialize<T>(raw, fallback);
    } catch (error) {
      console.error(`[StorageService] Failed to read key "${key}":`, error);
      return fallback !== undefined ? fallback : null;
    }
  }

  /**
   * Serialize and store an item by key.
   * Returns true on success, false if an error occurred.
   */
  async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      const serialized = this.serialize(value);
      await AsyncStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`[StorageService] Failed to set item for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove an item from storage by key.
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[StorageService] Failed to remove key "${key}":`, error);
      return false;
    }
  }

  /**
   * Check if a key exists in storage.
   */
  async hasItem(key: string): Promise<boolean> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw !== null;
    } catch (error) {
      console.error(`[StorageService] Failed to check existence of key "${key}":`, error);
      return false;
    }
  }

  /**
   * Retrieve multiple items at once.
   */
  async multiGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      for (const [key, value] of pairs) {
        result[key] = this.deserialize<T>(value);
      }
    } catch (error) {
      console.error('[StorageService] Failed to multiGet keys:', keys, error);
      for (const key of keys) {
        result[key] = null;
      }
    }
    return result;
  }

  /**
   * Return all keys currently stored in AsyncStorage.
   */
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('[StorageService] Failed to retrieve storage keys:', error);
      return [];
    }
  }

  /**
   * Clear all storage keys (use with caution).
   */
  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('[StorageService] Failed to clear storage:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
