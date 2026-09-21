import { create } from 'zustand';
import { authSessionStorage } from '../services/storage';
import {
  UserProfile,
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordCredentials,
} from '../features/auth/types/auth.types';
import { authApi } from '../services/api/authApi';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  forgotPassword: (credentials: ForgotPasswordCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  loadTokenFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);

      // Persist session (token in SecureStore, profile in AsyncStorage, NEVER passwords)
      await authSessionStorage.saveSession(response.token, response.user, response.refreshToken);

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Login failed. Please try again.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(credentials);

      // Persist session (token in SecureStore, profile in AsyncStorage, NEVER passwords)
      await authSessionStorage.saveSession(response.token, response.user, response.refreshToken);

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  forgotPassword: async (credentials: ForgotPasswordCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.forgotPassword(credentials);
      set({ isLoading: false, error: null });
      return response;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to send reset link.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
      await authSessionStorage.clearSession();
    } catch (error) {
      console.warn('[AuthStore] Error clearing storage during logout:', error);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),

  loadTokenFromStorage: async () => {
    set({ isLoading: true });
    try {
      const session = await authSessionStorage.loadSession();

      if (session.token && session.user) {
        set({
          token: session.token,
          user: session.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
}));
