import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_CONFIG } from './api.config';
import { handleAxiosError } from './apiError';
import { authSessionStorage } from '@/services/storage/repositories/auth-session.storage';

/**
 * Enterprise Axios Instance Configuration
 */
// eslint-disable-next-line import/no-named-as-default-member
const rawAxiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.getBaseUrl(),
  timeout: API_CONFIG.timeoutMs,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 1. Request Interceptor: Attach JWT Bearer Token if present in SecureStore
rawAxiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await authSessionStorage.getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[ApiClient] Failed to load auth token for request:', err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(handleAxiosError(error));
  }
);

// 2. Response Interceptor: Handle HTTP status codes and standardize errors
rawAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error?.response?.status === 401) {
      console.warn('[ApiClient] Received 401 Unauthorized - session may be expired.');
    }
    return Promise.reject(handleAxiosError(error));
  }
);

/**
 * Standardized High-Level API Client
 * Wraps Axios methods to guarantee standardized error types and unwrap responses cleanly.
 */
export const apiClient = {
  raw: rawAxiosInstance,

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await rawAxiosInstance.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await rawAxiosInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await rawAxiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await rawAxiosInstance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await rawAxiosInstance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
