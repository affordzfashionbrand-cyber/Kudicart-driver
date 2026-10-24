import { create } from 'zustand';
import { authApi } from '../api';
import { getAuthToken, setAuthToken } from '../api/client';

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  kycStatus: KycStatus | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (token: string, phone: string) => void;
  logout: () => Promise<void>;
  setKycStatus: (status: KycStatus) => void;
  sendOtpAsync: (phone: string) => Promise<{ success: boolean; message: string; mockOtp?: string }>;
  verifyOtpAsync: (phone: string, otp: string) => Promise<boolean>;
  syncStatusAsync: () => Promise<void>;
}

// Restore genuine existing token from client storage
const getInitialSession = (): { token: string | null; isAuthenticated: boolean } => {
  const existing = getAuthToken();
  if (existing) {
    return { token: existing, isAuthenticated: true };
  }
  return { token: null, isAuthenticated: false };
};

const initialSession = getInitialSession();

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: initialSession.isAuthenticated,
  phoneNumber: null,
  kycStatus: initialSession.isAuthenticated ? 'APPROVED' : null,
  token: initialSession.token,
  isLoading: false,
  error: null,

  login: (token: string, phone: string) => {
    setAuthToken(token);
    set({ isAuthenticated: true, kycStatus: 'PENDING', phoneNumber: phone, token });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Local fallback
    }
    setAuthToken(null);
    set({ isAuthenticated: false, kycStatus: null, phoneNumber: null, token: null });
  },

  setKycStatus: (status) => set({ kycStatus: status }),

  sendOtpAsync: async (phone: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.sendOtp(phone);
      set({ isLoading: false });
      return { success: res.success, message: res.message, mockOtp: res.mockOtp };
    } catch (err: any) {
      const message = err.message || 'Failed to dispatch OTP';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  verifyOtpAsync: async (phone: string, otp: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.verifyOtp(phone, otp);
      if (res.token) {
        setAuthToken(res.token);
      }
      set({
        isAuthenticated: true,
        phoneNumber: phone,
        kycStatus: (res.kycStatus as KycStatus) || 'PENDING',
        token: res.token,
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      const message = err.message || 'Invalid verification OTP';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  syncStatusAsync: async () => {
    try {
      const status = await authApi.getStatus();
      if (status && status.kycStatus) {
        set({
          kycStatus: status.kycStatus as KycStatus,
          isAuthenticated: true,
        });
      }
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        setAuthToken(null);
        set({ isAuthenticated: false, kycStatus: null, token: null });
      }
    }
  },
}));
