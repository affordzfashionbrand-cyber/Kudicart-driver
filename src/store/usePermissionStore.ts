import { create } from 'zustand';
import { AppState, Platform } from 'react-native';
import {
  permissionService,
  PermissionKey,
  PermissionDetail,
  PermissionStatus,
} from '../services/permissionService';

const SETUP_COMPLETED_KEY = 'kudicart_driver_device_setup_completed';

const getInitialSetupCompleted = (): boolean => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(SETUP_COMPLETED_KEY) === 'true';
  }
  return false;
};

interface PermissionState {
  permissions: Record<string, PermissionDetail>;
  isLoading: boolean;
  hasCompletedDeviceSetup: boolean;
  lastCheckedAt: number | null;

  // Actions
  checkAll: () => Promise<void>;
  requestPermission: (key: PermissionKey) => Promise<PermissionStatus>;
  openSettings: () => Promise<boolean>;
  completeDeviceSetup: () => void;
  resetDeviceSetup: () => void;
  isEssentialConfigured: () => boolean;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: {},
  isLoading: false,
  hasCompletedDeviceSetup: getInitialSetupCompleted(),
  lastCheckedAt: null,

  checkAll: async () => {
    set({ isLoading: true });
    try {
      const details = await permissionService.checkAll();
      set({
        permissions: details,
        isLoading: false,
        lastCheckedAt: Date.now(),
      });
    } catch {
      set({ isLoading: false });
    }
  },

  requestPermission: async (key: PermissionKey) => {
    set({ isLoading: true });
    try {
      const status = await permissionService.request(key);
      await get().checkAll();
      return status;
    } finally {
      set({ isLoading: false });
    }
  },

  openSettings: async () => {
    return await permissionService.openSettings();
  },

  completeDeviceSetup: () => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(SETUP_COMPLETED_KEY, 'true');
    }
    set({ hasCompletedDeviceSetup: true });
  },

  resetDeviceSetup: () => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(SETUP_COMPLETED_KEY);
    }
    set({ hasCompletedDeviceSetup: false });
  },

  isEssentialConfigured: () => {
    const { permissions } = get();
    const loc = permissions['location'];
    return loc?.status === 'granted';
  },
}));

// Setup automatic foreground listener to re-evaluate real OS permission state
// whenever returning from device system settings or another app.
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'active') {
    usePermissionStore.getState().checkAll().catch(() => {});
  }
});
