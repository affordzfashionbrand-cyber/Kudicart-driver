import { create } from 'zustand';
import { AppState, Platform } from 'react-native';
import {
  permissionService,
  PermissionKey,
  PermissionDetail,
  PermissionStatus,
} from '../services/permissionService';

const SETUP_COMPLETED_KEY = 'kudicart_driver_device_setup_completed_v3';
const DECISIONS_KEY = 'kudicart_driver_permission_decisions_v3';

// Clean up any legacy localStorage keys from prior test sessions
if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
  try {
    localStorage.removeItem('kudicart_driver_device_setup_completed');
    localStorage.removeItem('kudicart_driver_permission_decisions_v2');
  } catch {}
}

export const REQUIRED_DRIVER_PERMISSIONS: PermissionKey[] = [
  'location',
  'camera',
  'notifications',
  'phoneDialer',
];

const getInitialSetupCompleted = (): boolean => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(SETUP_COMPLETED_KEY) === 'true';
  }
  return false;
};

const getInitialDecisions = (): Record<string, 'granted' | 'denied'> => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(DECISIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
  }
  return {};
};

interface PermissionState {
  permissions: Record<string, PermissionDetail>;
  permissionDecisions: Record<string, 'granted' | 'denied'>;
  isLoading: boolean;
  hasCompletedDeviceSetup: boolean;
  lastCheckedAt: number | null;

  // Actions
  checkAll: () => Promise<void>;
  requestPermission: (key: PermissionKey) => Promise<PermissionStatus>;
  setPermissionDecision: (key: PermissionKey, decision: 'granted' | 'denied') => void;
  openSettings: () => Promise<boolean>;
  completeDeviceSetup: () => void;
  resetDeviceSetup: () => void;
  isPermissionGranted: (key: PermissionKey) => boolean;
  areAllPermissionsGranted: () => boolean;
  getMissingPermissions: () => PermissionKey[];
  isEssentialConfigured: () => boolean;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: {},
  permissionDecisions: getInitialDecisions(),
  isLoading: false,
  hasCompletedDeviceSetup: getInitialSetupCompleted(),
  lastCheckedAt: null,

  checkAll: async () => {
    set({ isLoading: true });
    try {
      const details = await permissionService.checkAll();
      const currentDecisions = { ...get().permissionDecisions };

      // Sync verified OS revoked/denied statuses into decisions (on Android)
      if (Platform.OS === 'android') {
        REQUIRED_DRIVER_PERMISSIONS.forEach((key) => {
          if (details[key]?.status === 'denied' || details[key]?.status === 'never_ask_again') {
            currentDecisions[key] = 'denied';
          }
        });
      }

      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem(DECISIONS_KEY, JSON.stringify(currentDecisions));
      }

      set({
        permissions: details,
        permissionDecisions: currentDecisions,
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
      if (status === 'granted') {
        get().setPermissionDecision(key, 'granted');
      }
      return status;
    } catch {
      return 'denied';
    } finally {
      set({ isLoading: false });
    }
  },

  setPermissionDecision: (key: PermissionKey, decision: 'granted' | 'denied') => {
    set((state) => {
      const updated = { ...state.permissionDecisions, [key]: decision };
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem(DECISIONS_KEY, JSON.stringify(updated));
      }
      return { permissionDecisions: updated };
    });
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
      localStorage.removeItem(DECISIONS_KEY);
    }
    set({
      hasCompletedDeviceSetup: false,
      permissionDecisions: {},
    });
  },

  isPermissionGranted: (key: PermissionKey) => {
    const { permissions, permissionDecisions } = get();
    // 1. If explicitly marked as denied in our in-app prompt, it is denied
    if (permissionDecisions[key] === 'denied') {
      return false;
    }
    // 2. If OS explicitly reports denied on Android, it is denied
    if (
      Platform.OS === 'android' &&
      (permissions[key]?.status === 'denied' || permissions[key]?.status === 'never_ask_again')
    ) {
      return false;
    }
    // 3. Must be granted by user decision
    if (permissionDecisions[key] === 'granted') {
      return true;
    }
    return false;
  },

  areAllPermissionsGranted: () => {
    return REQUIRED_DRIVER_PERMISSIONS.every((key) => get().isPermissionGranted(key));
  },

  getMissingPermissions: () => {
    return REQUIRED_DRIVER_PERMISSIONS.filter((key) => !get().isPermissionGranted(key));
  },

  isEssentialConfigured: () => {
    return get().isPermissionGranted('location');
  },
}));

// Setup automatic foreground listener to re-evaluate real OS permission state
// whenever returning from device system settings or another app.
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'active') {
    usePermissionStore.getState().checkAll().catch(() => {});
  }
});
