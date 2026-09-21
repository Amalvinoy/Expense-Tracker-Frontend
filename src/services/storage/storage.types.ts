/**
 * Storage Abstraction Types & Interfaces
 */

export interface IStorageService {
  getItem<T>(key: string, fallback?: T): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<boolean>;
  removeItem(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
  hasItem(key: string): Promise<boolean>;
  getAllKeys(): Promise<readonly string[]>;
  multiGet<T>(keys: string[]): Promise<Record<string, T | null>>;
}

export interface ISecureStorageService {
  getItem<T = string>(key: string, fallback?: T): Promise<T | null>;
  setItem<T = string>(key: string, value: T): Promise<boolean>;
  deleteItem(key: string): Promise<boolean>;
  removeItem(key: string): Promise<boolean>; // Alias for deleteItem
  isAvailable(): Promise<boolean>;
}

export interface StoredAuthSession {
  token: string;
  refreshToken?: string;
  userId: string;
  savedAt: string;
}
