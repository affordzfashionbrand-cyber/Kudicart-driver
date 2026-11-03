import { create } from 'zustand';
import { authApi } from '../api';
import { getAuthToken, setAuthToken, loadStoredAuthToken } from '../api/client';
import { notificationService } from '../services/notificationService';

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
  sendOtpAsync: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOtpAsync: (phone: string, otp: string) => Promise<boolean>;
  loginWithFirebaseAsync: (idToken: string) => Promise<boolean>;
  syncStatusAsync: () => Promise<void>;
  restoreSessionAsync: () => Promise<void>;
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
  kycStatus: null,
  token: initialSession.token,
  isLoading: false,
  error: null,

  login: (token: string, phone: string) => {
    setAuthToken(token);
    set({ isAuthenticated: true, kycStatus: 'PENDING', phoneNumber: phone, token });
  },

  logout: async () => {
    try {
      await notificationService.unregisterDeviceToken().catch(() => {});
      notificationService.teardownListeners();
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
      return { success: res.success, message: res.message };
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
      notificationService.registerDeviceToken().catch(() => {});
      notificationService.setupNotificationListeners();
      return true;
    } catch (err: any) {
      const message = err.message || 'Invalid verification OTP';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  loginWithFirebaseAsync: async (idToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.loginFirebase(idToken);
      if (res.token) {
        setAuthToken(res.token);
      }
      set({
        isAuthenticated: true,
        phoneNumber: res.user?.phone || null,
        kycStatus: (res.kycStatus as KycStatus) || 'PENDING',
        token: res.token,
        isLoading: false,
      });
      notificationService.registerDeviceToken().catch(() => {});
      notificationService.setupNotificationListeners();
      return true;
    } catch (err: any) {
      const message = err.message || 'Firebase driver login failed';
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

  restoreSessionAsync: async () => {
    try {
      const token = await loadStoredAuthToken();
      if (token) {
        set({
          token,
          isAuthenticated: true,
          kycStatus: get().kycStatus || 'PENDING',
        });
        get().syncStatusAsync().catch(() => {});
        notificationService.registerDeviceToken().catch(() => {});
        notificationService.setupNotificationListeners();
      }
    } catch {}
  },
}));

// Automatically trigger session restoration from native storage / localStorage
useAuthStore.getState().restoreSessionAsync();

