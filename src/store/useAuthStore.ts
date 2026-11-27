import { create } from 'zustand';
import { NativeModules, Platform } from 'react-native';
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
import { authApi, profileApi } from '../api';
import { notificationService } from '../services/notificationService';
import { driverSocket } from '../services/driverSocket';
import { locationTrackingService } from '../services/locationTrackingService';
import { useOrderStore } from './useOrderStore';
import { useDriverStore } from './useDriverStore';
import { useNotificationStore } from './useNotificationStore';

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

const KYC_APPROVED_SEEN_KEY = 'kudicart_driver_kyc_approved_seen';

function buildApprovalSeenKey(driverId?: string | null, phone?: string | null): string {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
  const idPart = (driverId || cleanPhone || 'default').trim();
  return `${KYC_APPROVED_SEEN_KEY}_${idPart}`;
}

async function persistApprovalSeenFlag(
  seen: boolean,
  driverId?: string | null,
  phone?: string | null,
): Promise<void> {
  const keys = [KYC_APPROVED_SEEN_KEY, buildApprovalSeenKey(driverId, phone)];
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    for (const key of keys) {
      if (seen) {
        localStorage.setItem(key, 'true');
      } else {
        localStorage.removeItem(key);
      }
    }
    return;
  }
  const nativeStorage = NativeModules?.NativeTrackingModule;
  if (nativeStorage) {
    for (const key of keys) {
      try {
        if (seen && typeof nativeStorage.setSecureItem === 'function') {
          await nativeStorage.setSecureItem(key, 'true');
        } else if (!seen && typeof nativeStorage.removeSecureItem === 'function') {
          await nativeStorage.removeSecureItem(key);
        }
      } catch {}
    }
  }
}

async function readApprovalSeenFlag(
  driverId?: string | null,
  phone?: string | null,
): Promise<boolean> {
  const specificKey = buildApprovalSeenKey(driverId, phone);
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(specificKey) === 'true';
  }
  const nativeStorage = NativeModules?.NativeTrackingModule;
  if (nativeStorage && typeof nativeStorage.getSecureItem === 'function') {
    try {
      const val = await nativeStorage.getSecureItem(specificKey);
      return val === 'true';
    } catch {
      return false;
    }
  }
  return false;
}

const getInitialKycApprovedSeen = (): boolean => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(KYC_APPROVED_SEEN_KEY) === 'true';
  }
  return false;
};

interface AuthState {
  isAuthenticated: boolean;
  driverId: string | null;
  phoneNumber: string | null;
  kycStatus: KycStatus | null;
  rejectionReason: string | null;
  token: string | null;
  authMode: 'firebase' | 'dev-otp' | null;
  isLoading: boolean;
  error: string | null;
  hasSeenKycApproved: boolean;

  // Actions
  login: (token: string, phone: string) => void;
  logout: () => Promise<void>;
  setKycStatus: (status: KycStatus) => void;
  setHasSeenKycApproved: (seen: boolean) => void;
  acknowledgeApprovalAsync: () => Promise<void>;
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
  driverId: null,
  phoneNumber: null,
  kycStatus: null,
  rejectionReason: null,
  token: initialSession.token,
  isLoading: false,
  error: null,
  hasSeenKycApproved: getInitialKycApprovedSeen(),

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
    // Preserve per-driver onboarding acknowledgment in persistent storage across logouts
    locationTrackingService.stopTracking();
    driverSocket.disconnect();
    useOrderStore.getState().clearOrders();
    useDriverStore.getState().clearKycData();
    useDriverStore.getState().setIsOnline(false);
    useNotificationStore.getState().reset();
    setAuthToken(null);
    set({
      isAuthenticated: false,
      driverId: null,
      kycStatus: null,
      phoneNumber: null,
      token: null,
      hasSeenKycApproved: false,
    });
  },

  setKycStatus: (status) => {
    if (status !== 'APPROVED') {
      void persistApprovalSeenFlag(false, get().driverId, get().phoneNumber);
      set({ kycStatus: status, hasSeenKycApproved: false });
    } else {
      set({ kycStatus: status });
    }
  },

  setHasSeenKycApproved: (seen: boolean) => {
    void persistApprovalSeenFlag(seen, get().driverId, get().phoneNumber);
    set({ hasSeenKycApproved: seen });
  },

  acknowledgeApprovalAsync: async () => {
    const { driverId, phoneNumber } = get();
    await profileApi.acknowledgeApproval();
    await persistApprovalSeenFlag(true, driverId, phoneNumber);
    set({ hasSeenKycApproved: true });
  },

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
      const resolvedDriverId = res.driverId || res.user?.driverId || null;
      const serverSeenApproval = Boolean(res.hasSeenApproval ?? res.user?.hasSeenApproval);
      const localSeenApproval =
        resolvedKycStatus === 'APPROVED'
          ? await readApprovalSeenFlag(resolvedDriverId, phone)
          : false;
      const effectiveSeenApproval =
        resolvedKycStatus === 'APPROVED' && (serverSeenApproval || localSeenApproval);
      if (effectiveSeenApproval) {
        void persistApprovalSeenFlag(true, resolvedDriverId, phone);
      }
      set({
        isAuthenticated: true,
        driverId: resolvedDriverId,
        phoneNumber: phone,
        kycStatus: resolvedKycStatus,
        hasSeenKycApproved: effectiveSeenApproval,
        token: res.token,
        isLoading: false,
      });
      notificationService.registerDeviceToken().catch(() => {});
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
      const resolvedDriverId = res.driverId || res.user?.driverId || null;
      const resolvedPhone = res.user?.phone || null;
      const serverSeenApproval = Boolean(res.hasSeenApproval ?? res.user?.hasSeenApproval);
      const localSeenApproval =
        resolvedKycStatus === 'APPROVED'
          ? await readApprovalSeenFlag(resolvedDriverId, resolvedPhone)
          : false;
      const effectiveSeenApproval =
        resolvedKycStatus === 'APPROVED' && (serverSeenApproval || localSeenApproval);
      if (effectiveSeenApproval) {
        void persistApprovalSeenFlag(true, resolvedDriverId, resolvedPhone);
      }
      set({
        isAuthenticated: true,
        driverId: resolvedDriverId,
        phoneNumber: resolvedPhone,
        kycStatus: resolvedKycStatus,
        hasSeenKycApproved: effectiveSeenApproval,
        token: res.token,
        isLoading: false,
      });
      notificationService.registerDeviceToken().catch(() => {});
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
      const isDevMode = typeof __DEV__ !== 'undefined' ? Boolean(__DEV__) : process.env.NODE_ENV !== 'production';
      if (isDevMode) {
        try {
          const res = await get().sendOtpAsync(phone);
          set({ authMode: 'dev-otp', isLoading: false });
          return {
            success: res.success,
            mode: 'dev-otp' as const,
            message: res.message || `OTP sent to ${phone}`,
            ...((res as any).devOtp ? { devOtp: (res as any).devOtp } : {}),
          };
        } catch (backendErr: any) {
          const msg = backendErr?.message || 'Failed to dispatch verification OTP';
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      }

      if (err?.code === 'FIREBASE_UNAVAILABLE') {
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
    const isDevMode = typeof __DEV__ !== 'undefined' ? Boolean(__DEV__) : process.env.NODE_ENV !== 'production';
    try {
      const mode = get().authMode;
      if (mode === 'dev-otp') {
        const ok = await get().verifyOtpAsync(phone, otp);
        if (!ok) {
          throw new Error(get().error || 'Invalid OTP. Please try again.');
        }
        set({ authMode: 'dev-otp', isLoading: false, error: null });
        return true;
      }

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

      if (!isDevMode) {
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
        const nextStatus = status.kycStatus as KycStatus;
        const resolvedDriverId = status.driverId || get().driverId;
        if (nextStatus !== 'APPROVED') {
          await persistApprovalSeenFlag(false, resolvedDriverId, get().phoneNumber);
          set({
            driverId: resolvedDriverId,
            kycStatus: nextStatus,
            rejectionReason: status.rejectionReason || null,
            isAuthenticated: true,
            hasSeenKycApproved: false,
            error: null,
          });
        } else {
          const localSeen = await readApprovalSeenFlag(resolvedDriverId, get().phoneNumber);
          const effectiveSeen = Boolean(status.hasSeenApproval || localSeen);
          if (effectiveSeen && !status.hasSeenApproval) {
            profileApi.acknowledgeApproval().catch(() => {});
          }
          if (effectiveSeen) {
            void persistApprovalSeenFlag(true, resolvedDriverId, get().phoneNumber);
          }
          set({
            driverId: resolvedDriverId,
            kycStatus: nextStatus,
            rejectionReason: status.rejectionReason || null,
            isAuthenticated: true,
            hasSeenKycApproved: effectiveSeen,
            error: null,
          });
        }
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

