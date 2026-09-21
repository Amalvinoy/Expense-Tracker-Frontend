import {
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordCredentials,
  AuthResponse,
  UserProfile,
} from '../types/auth.types';

/**
 * Helper to simulate network latency
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock Auth Service
 * Structured identically to a real REST API client.
 * Replace with apiClient.post('/auth/...') when backend is connected.
 */
export const mockAuthService = {
  /**
   * Mock Login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800);

    // Simulated API error condition for test purposes
    if (credentials.email === 'error@example.com') {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const mockUser: UserProfile = {
      id: 'usr_mock_101',
      name: credentials.email.split('@')[0].replace('.', ' '),
      email: credentials.email,
      createdAt: new Date().toISOString(),
    };

    const mockToken = `mock_jwt_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      user: mockUser,
      token: mockToken,
    };
  },

  /**
   * Mock Register
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    await delay(900);

    // Simulated duplicate account error
    if (credentials.email === 'exists@example.com') {
      throw new Error('An account with this email address already exists.');
    }

    const mockUser: UserProfile = {
      id: `usr_mock_${Date.now()}`,
      name: credentials.name,
      email: credentials.email,
      createdAt: new Date().toISOString(),
    };

    const mockToken = `mock_jwt_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      user: mockUser,
      token: mockToken,
    };
  },

  /**
   * Mock Forgot Password
   */
  async forgotPassword(credentials: ForgotPasswordCredentials): Promise<{ success: boolean; message: string }> {
    await delay(700);

    if (credentials.email === 'notfound@example.com') {
      throw new Error('No active account found with this email address.');
    }

    return {
      success: true,
      message: `Password reset instructions have been sent to ${credentials.email}.`,
    };
  },
};
