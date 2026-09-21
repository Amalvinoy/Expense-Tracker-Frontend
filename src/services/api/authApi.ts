import { apiClient } from './apiClient';
import {
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordCredentials,
  AuthResponse,
  UserProfile,
} from '@/features/auth/types/auth.types';

/**
 * Authentication API Service
 * Handles user login, registration, session checks, and password reset via backend.
 */
export const authApi = {
  /**
   * Log in user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<any>('/auth/login', credentials);
    const data = res?.data || res;
    return {
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken,
    };
  },

  /**
   * Register a new user account
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<any>('/auth/register', credentials);
    const data = res?.data || res;
    return {
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken,
    };
  },

  /**
   * Get current authenticated user profile
   */
  async getProfile(): Promise<UserProfile> {
    const res = await apiClient.get<any>('/auth/me');
    return res?.data?.user || res?.user || res?.data || res;
  },

  /**
   * Request password reset instructions
   */
  async forgotPassword(
    credentials: ForgotPasswordCredentials
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<any>('/auth/forgot-password', credentials);
    return {
      success: res?.success ?? true,
      message: res?.message || 'Password reset instructions have been sent if account exists.',
    };
  },

  /**
   * Log out active session from backend
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Proceed with local logout regardless of network response
    }
  },
};
