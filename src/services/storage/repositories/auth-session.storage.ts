import { secureStorageService } from '../secure-storage.service';
import { storageService } from '../storage.service';
import { SECURE_KEYS, STORAGE_KEYS } from '../storage.keys';
import { UserProfile } from '@/features/auth/types/auth.types';

export interface AuthSessionData {
  token: string | null;
  refreshToken?: string | null;
  user: UserProfile | null;
}

/**
 * Authentication Session Storage Repository.
 * Safely partitions sensitive tokens to SecureStore while keeping public profile data in AsyncStorage.
 * Strictly adheres to security rules: Passwords are NEVER persisted.
 */
export const authSessionStorage = {
  /**
   * Save an active authentication session.
   * Auth token and refresh token -> encrypted SecureStore.
   * User profile data -> AsyncStorage.
   */
  async saveSession(token: string, user: UserProfile, refreshToken?: string): Promise<boolean> {
    try {
      const [tokenSaved, userSaved] = await Promise.all([
        secureStorageService.setItem(SECURE_KEYS.AUTH_TOKEN, token),
        storageService.setItem(STORAGE_KEYS.USER_PREFERENCES, user),
      ]);

      if (refreshToken) {
        await secureStorageService.setItem(SECURE_KEYS.REFRESH_TOKEN, refreshToken);
      }

      return tokenSaved && userSaved;
    } catch (error) {
      console.error('[AuthSessionStorage] Failed to save authentication session:', error);
      return false;
    }
  },

  /**
   * Load the currently stored authentication session.
   */
  async loadSession(): Promise<AuthSessionData> {
    try {
      const [token, refreshToken, user] = await Promise.all([
        secureStorageService.getItem(SECURE_KEYS.AUTH_TOKEN),
        secureStorageService.getItem(SECURE_KEYS.REFRESH_TOKEN),
        storageService.getItem<UserProfile>(STORAGE_KEYS.USER_PREFERENCES),
      ]);

      return {
        token,
        refreshToken,
        user,
      };
    } catch (error) {
      console.error('[AuthSessionStorage] Failed to load session:', error);
      return { token: null, refreshToken: null, user: null };
    }
  },

  /**
   * Quick check or retrieval of current auth token (e.g. for API client interceptor).
   */
  async getAuthToken(): Promise<string | null> {
    return secureStorageService.getItem(SECURE_KEYS.AUTH_TOKEN);
  },

  /**
   * Clear all session data on logout.
   */
  async clearSession(): Promise<void> {
    try {
      await Promise.all([
        secureStorageService.deleteItem(SECURE_KEYS.AUTH_TOKEN),
        secureStorageService.deleteItem(SECURE_KEYS.REFRESH_TOKEN),
        storageService.removeItem(STORAGE_KEYS.USER_PREFERENCES),
      ]);
    } catch (error) {
      console.warn('[AuthSessionStorage] Error clearing session storage:', error);
    }
  },
};
