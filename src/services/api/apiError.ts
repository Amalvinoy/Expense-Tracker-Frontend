import { AxiosError } from 'axios';

/**
 * Standardized API Error Representation
 * Normalizes HTTP status codes, network dropouts, timeout exceptions, and validation payloads.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]> | string[];
  public readonly isNetworkError: boolean;
  public readonly isTimeout: boolean;
  public readonly code?: string;
  public readonly rawError?: any;

  constructor(params: {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]> | string[];
    isNetworkError?: boolean;
    isTimeout?: boolean;
    code?: string;
    rawError?: any;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.statusCode = params.statusCode !== undefined ? params.statusCode : 500;
    this.errors = params.errors;
    this.isNetworkError = params.isNetworkError ?? false;
    this.isTimeout = params.isTimeout ?? false;
    this.code = params.code;
    this.rawError = params.rawError;

    // Restore prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Transforms an Axios error or generic error into a standardized ApiError.
 */
export function handleAxiosError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const axiosError = error as AxiosError<any>;

  if (axiosError?.isAxiosError) {
    const statusCode = axiosError.response?.status || 0;
    const responseData = axiosError.response?.data;

    // 1. Check for request timeout
    if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
      return new ApiError({
        message: 'The server took too long to respond. Please check your connection and try again.',
        statusCode: 408,
        isTimeout: true,
        code: 'TIMEOUT',
        rawError: error,
      });
    }

    // 2. Check for network disconnection / unreachable host
    if (!axiosError.response && (axiosError.code === 'ERR_NETWORK' || !statusCode)) {
      return new ApiError({
        message: 'Unable to connect to the server. Please check your internet connection.',
        statusCode: 0,
        isNetworkError: true,
        code: 'NETWORK_ERROR',
        rawError: error,
      });
    }

    // 3. Extract backend validation message / error details
    const backendMessage =
      responseData?.message ||
      responseData?.error ||
      (typeof responseData === 'string' ? responseData : null);

    const fallbackMessage =
      statusCode === 401
        ? 'Invalid or expired session. Please log in again.'
        : statusCode === 403
        ? 'You do not have permission to perform this action.'
        : statusCode === 404
        ? 'The requested resource was not found.'
        : statusCode >= 500
        ? 'An unexpected server error occurred. Please try again later.'
        : 'An error occurred while processing your request.';

    return new ApiError({
      message: backendMessage || fallbackMessage,
      statusCode,
      errors: responseData?.errors,
      code: responseData?.code || axiosError.code,
      rawError: error,
    });
  }

  // Generic non-Axios error
  const genericMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  return new ApiError({
    message: genericMessage,
    statusCode: 500,
    rawError: error,
  });
}
