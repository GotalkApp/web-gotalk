import api from './api';
import {
    RegisterRequest,
    LoginRequest,
    VerifyOTPRequest,
    AuthResponse,
    OTPSentResponse,
    UserResponse,
} from '../types';

export const authService = {
    /**
     * POST /auth/register
     * Register new user + send OTP
     */
    register: async (data: RegisterRequest): Promise<OTPSentResponse> => {
        const response = await api.post<OTPSentResponse>('/auth/register', data);
        return response.data;
    },

    /**
     * POST /auth/verify-otp
     * Verify OTP → activate account → get token
     */
    verifyOTP: async (data: VerifyOTPRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/verify-otp', data);
        return response.data;
    },

    /**
     * POST /auth/login
     * Login with email/password → get token
     */
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    /**
     * GET /auth/profile
     * Get current user profile (requires token)
     */
    getProfile: async (): Promise<UserResponse> => {
        const response = await api.get<UserResponse>('/auth/profile');
        return response.data;
    },

    /**
     * POST /auth/logout
     * Invalidate current token
     * Note: Wraps in try/catch to allow client-side logout even if API fails (e.g. 404)
     */
    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Ignore server errors during logout to ensure client cleanup
            console.warn('Server logout failed, proceeding with client logout:', error);
        }
    },
};
