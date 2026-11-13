import { create } from 'zustand';
import {
  getAuthToken,
  setAuthToken,
  loadStoredAuthToken,
  registerTokenRefreshHandler,
  registerUnauthorizedHandler,
  resetAuthClientState,
  setAuthTokenIssuedAt,
} from '../api/client';
import { firebaseAuthService } from '../services/firebaseAuth';
import { authApi } from '../api';
import { notificationService } from '../services/notificationService';
import { driverSocket } from '../services/driverSocket';
import { locationTrackingService } from '../services/locationTrackingService';
import { useOrderStore } from './useOrderStore';
import { useDriverStore } from './useDriverStore';
import { useNotificationStore } from './useNotificationStore';
import { toast } from './useToastStore';

const handleDefaultNotification = (message: any) => {
  const orderId = message?.data?.orderId;
  if (orderId) {
    useOrderStore.getState().refreshOrderAsync(String(orderId)).catch(() => {});
  }
  useNotificationStore.getState().fetchNotificationsAsync().catch(() => {});
  const title = message?.notification?.title;
  const body = message?.notification?.body;
  if (title || body) {
    try {
      toast.show({
        type: 'info',
        message: title ? `${title}${body ? `: ${body}` : ''}` : String(body),
      });
    } catch {}
  }
};

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  kycStatus: KycStatus | null;
  token: string | null;
  authMode: 'firebase' | 'dev-otp' | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (token: string, phone: string) => void;
  logout: () => Promise<void>;
  setKycStatus: (status: KycStatus) => void;
  sendOtpAsync: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOtpAsync: (phone: string, otp: string) => Promise<boolean>;
  sendPhoneOtpAsync: (
    phone: string,
  ) => Promise<{ success: boolean; mode: 'firebase' | 'dev-otp'; message: string }>;
  confirmPhoneOtpAsync: (phone: string, otp: string) => Promise<boolean>;
  refreshAuthTokenAsync: () => Promise<string | null>;
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
    locationTrackingService.stopTracking();
    driverSocket.disconnect();
    useOrderStore.getState().clearOrders();
    useDriverStore.getState().clearKycData();
    useDriverStore.getState().setIsOnline(false);
    useNotificationStore.getState().reset();
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
      const resolvedKycStatus = (res.kycStatus || res.user?.kycStatus || 'NOT_SUBMITTED') as KycStatus;
      set({
        isAuthenticated: true,
        phoneNumber: phone,
        kycStatus: resolvedKycStatus,
        token: res.token,
        isLoading: false,
      });
      notificationService.registerDeviceToken().catch(() => {});
      notificationService.setupNotificationListeners(handleDefaultNotification);
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
      const resolvedKycStatus = (res.kycStatus || res.user?.kycStatus || 'NOT_SUBMITTED') as KycStatus;
      set({
        isAuthenticated: true,
        phoneNumber: res.user?.phone || null,
        kycStatus: resolvedKycStatus,
        token: res.token,
        isLoading: false,
      });
      notificationService.registerDeviceToken().catch(() => {});
      notificationService.setupNotificationListeners(handleDefaultNotification);
      return true;
    } catch (err: any) {
      const message = err.message || 'Firebase driver login failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  authMode: null,

  sendPhoneOtpAsync: async (phone: string) => {
    set({ isLoading: true, error: null });
    try {
      await firebaseAuthService.sendPhoneOtp(phone);
      set({ isLoading: false, authMode: 'firebase', error: null });
      return {
        success: true,
        mode: 'firebase' as const,
        message: `OTP sent via Firebase to ${phone}`,
      };
    } catch (err: any) {
      if (err?.code === 'FIREBASE_UNAVAILABLE') {
        const isDevMode = typeof __DEV__ !== 'undefined' && __DEV__;
        if (isDevMode) {
          try {
            const res = await get().sendOtpAsync(phone);
            set({ authMode: 'dev-otp', isLoading: false });
            return {
              success: res.success,
              mode: 'dev-otp' as const,
              message: res.message || `OTP sent to ${phone}`,
            };
          } catch (backendErr: any) {
            const msg = backendErr?.message || 'Failed to dispatch verification OTP';
            set({ isLoading: false, error: msg });
            throw new Error(msg);
          }
        }
        const prodErrMsg =
          'Firebase Phone Auth is required in production builds and is unavailable on this device.';
        set({ isLoading: false, error: prodErrMsg });
        throw new Error(prodErrMsg);
      }

      const msg = err?.message || 'Unable to send OTP via Firebase.';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  confirmPhoneOtpAsync: async (phone: string, otp: string) => {
    set({ isLoading: true, error: null });
    const isDevMode = typeof __DEV__ !== 'undefined' && __DEV__;
    try {
      if (firebaseAuthService.hasPendingConfirmation()) {
        const idToken = await firebaseAuthService.confirmPhoneOtp(otp);
        setAuthTokenIssuedAt(Date.now());
        const ok = await get().loginWithFirebaseAsync(idToken);
        if (ok) {
          set({ authMode: 'firebase', isLoading: false, error: null });
          return true;
        }
        throw new Error(get().error || 'Failed to authenticate driver session.');
      }

      if (!isDevMode && !firebaseAuthService.hasPendingConfirmation()) {
        throw new Error('Firebase verification session expired. Please request a new OTP.');
      }

      const ok = await get().verifyOtpAsync(phone, otp);
      if (!ok) {
        throw new Error(get().error || 'Invalid OTP. Please try again.');
      }
      set({ authMode: 'dev-otp', isLoading: false, error: null });
      return true;
    } catch (err: any) {
      const msg = err?.message || 'OTP verification failed.';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  refreshAuthTokenAsync: async () => {
    const freshIdToken = await firebaseAuthService.getFreshIdToken(true);
    if (!freshIdToken) {
      return null;
    }
    try {
      const res = await authApi.loginFirebase(freshIdToken);
      if (res?.token) {
        setAuthToken(res.token);
        setAuthTokenIssuedAt(Date.now());
        set({
          token: res.token,
          isAuthenticated: true,
          kycStatus: (res.user?.kycStatus as KycStatus) || get().kycStatus,
          error: null,
        });
        return res.token;
      }
      return null;
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        return null;
      }
      return null;
    }
  },

  syncStatusAsync: async () => {
    try {
      const status = await authApi.getStatus();
      if (status && status.kycStatus) {
        set({
          kycStatus: status.kycStatus as KycStatus,
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (err: any) {
      if (err?.status === 401) {
        setAuthToken(null);
        resetAuthClientState();
        await firebaseAuthService.signOut().catch(() => {});
        set({ isAuthenticated: false, kycStatus: null, token: null, authMode: null });
      } else if (err?.status === 403) {
        set({ error: err?.message || 'Account access restricted.' });
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
        await get().syncStatusAsync();
        if (get().isAuthenticated) {
          notificationService.registerDeviceToken().catch(() => {});
          notificationService.setupNotificationListeners(handleDefaultNotification);
        }
      }
    } catch {}
  },
}));

const rawStoreLogout = useAuthStore.getState().logout;
useAuthStore.setState({
  logout: async () => {
    await firebaseAuthService.signOut().catch(() => {});
    resetAuthClientState();
    driverSocket.resetSessionState();
    await rawStoreLogout();
    useAuthStore.setState({ authMode: null });
  },
});

registerTokenRefreshHandler(() => useAuthStore.getState().refreshAuthTokenAsync());
registerUnauthorizedHandler(async () => {
  if (useAuthStore.getState().isAuthenticated) {
    await useAuthStore.getState().logout();
  } else {
    setAuthToken(null);
    resetAuthClientState();
    await firebaseAuthService.signOut().catch(() => {});
  }
});

firebaseAuthService.onIdTokenChanged((freshIdToken) => {
  const state = useAuthStore.getState();
  if (!state.isAuthenticated || !freshIdToken) {
    return;
  }
  void state.refreshAuthTokenAsync();
});

// Automatically trigger session restoration from native storage / localStorage
useAuthStore.getState().restoreSessionAsync();

