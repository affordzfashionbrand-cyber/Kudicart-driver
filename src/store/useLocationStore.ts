import { create } from 'zustand';
import { AppState, Platform } from 'react-native';
import { permissionService, PermissionStatus } from '../services/permissionService';
import { isValidCoordinatePair, MAX_ACCEPTABLE_GPS_ACCURACY_METERS } from '../utils/geospatial';

export type GpsLocationState =
  | 'IDLE'
  | 'ACQUIRING'
  | 'READY'
  | 'PERMISSION_DENIED'
  | 'SERVICES_DISABLED'
  | 'POOR_ACCURACY'
  | 'STALE'
  | 'UNAVAILABLE';

export interface GpsFix {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

interface LocationStoreState {
  gpsState: GpsLocationState;
  permissionStatus: PermissionStatus;
  coords: GpsFix | null;
  errorMessage: string | null;
  isWatching: boolean;

  checkPermissionOnly: () => Promise<PermissionStatus>;
  refreshLocationState: (options?: {
    requestPermission?: boolean;
    timeoutMs?: number;
    highAccuracy?: boolean;
  }) => Promise<GpsFix | null>;
  startWatch: (mode?: 'passive' | 'navigation') => void;
  stopWatch: () => void;
  resetLocationState: () => void;
}

const STALE_FIX_THRESHOLD_MS = 90_000;
let activeWatchId: number | null = null;
let watchConsumerCount = 0;
let currentWatchMode: 'passive' | 'navigation' = 'passive';
let appStateSub: { remove?: () => void } | null = null;
let webVisListener: (() => void) | null = null;

function getGeolocationApi(): Geolocation | null {
  const geo = (globalThis as any)?.navigator?.geolocation;
  if (geo && typeof geo.getCurrentPosition === 'function') {
    return geo as Geolocation;
  }
  return null;
}

function classifyPosition(pos: GeolocationPosition): {
  fix: GpsFix | null;
  nextState: GpsLocationState;
  message: string | null;
} {
  const c = pos?.coords;
  if (!c || !isValidCoordinatePair(c.latitude, c.longitude)) {
    return {
      fix: null,
      nextState: 'UNAVAILABLE',
      message: 'Location unavailable',
    };
  }
  const accuracy =
    typeof c.accuracy === 'number' && Number.isFinite(c.accuracy) ? c.accuracy : null;
  const fix: GpsFix = {
    latitude: c.latitude,
    longitude: c.longitude,
    accuracy,
    heading: typeof c.heading === 'number' && Number.isFinite(c.heading) ? c.heading : null,
    speed: typeof c.speed === 'number' && Number.isFinite(c.speed) ? c.speed : null,
    timestamp: pos.timestamp || Date.now(),
  };

  if (accuracy !== null && accuracy > MAX_ACCEPTABLE_GPS_ACCURACY_METERS) {
    return {
      fix,
      nextState: 'POOR_ACCURACY',
      message: 'GPS signal is weak. Try again in an open area.',
    };
  }

  return {
    fix,
    nextState: 'READY',
    message: null,
  };
}

function classifyGeoError(
  err: GeolocationPositionError | any,
  prevFix: GpsFix | null,
): { state: GpsLocationState; message: string } {
  const code = typeof err?.code === 'number' ? err.code : 0;
  if (code === 1) {
    return {
      state: 'PERMISSION_DENIED',
      message: 'Allow location access to go online.',
    };
  }
  if (code === 2) {
    return {
      state: 'SERVICES_DISABLED',
      message: 'Turn on location services to continue.',
    };
  }
  if (prevFix && Date.now() - prevFix.timestamp > STALE_FIX_THRESHOLD_MS) {
    return {
      state: 'STALE',
      message: 'Turn on location services to continue.',
    };
  }
  return {
    state: 'UNAVAILABLE',
    message: 'Turn on location services to continue.',
  };
}

export const useLocationStore = create<LocationStoreState>((set, get) => ({
  gpsState: 'IDLE',
  permissionStatus: 'not_requested',
  coords: null,
  errorMessage: null,
  isWatching: false,

  checkPermissionOnly: async () => {
    const perm = await permissionService.check('location');
    if (perm === 'denied' || perm === 'never_ask_again') {
      set({
        permissionStatus: perm,
        gpsState: 'PERMISSION_DENIED',
        errorMessage: 'Allow location access to go online.',
      });
    } else if (perm === 'granted' || perm === 'limited') {
      set((state) => ({
        permissionStatus: perm,
        ...(state.gpsState === 'PERMISSION_DENIED'
          ? { gpsState: 'IDLE' as GpsLocationState, errorMessage: null }
          : {}),
      }));
    } else {
      set({ permissionStatus: perm });
    }
    return perm;
  },

  refreshLocationState: async (options) => {
    const requestPerm = Boolean(options?.requestPermission);
    const timeoutMs = options?.timeoutMs ?? 5500;
    const highAccuracy = options?.highAccuracy ?? true;

    let perm = await permissionService.check('location');
    if (perm === 'never_ask_again' || (perm === 'denied' && !requestPerm)) {
      set({
        permissionStatus: perm,
        gpsState: 'PERMISSION_DENIED',
        errorMessage: 'Allow location access to go online.',
      });
      return null;
    }

    if (perm !== 'granted' && perm !== 'limited') {
      if (!requestPerm) {
        set({
          permissionStatus: perm,
          gpsState: 'PERMISSION_DENIED',
          errorMessage: 'Allow location access to go online.',
        });
        return null;
      }
      perm = await permissionService.request('location');
      if (perm !== 'granted' && perm !== 'limited') {
        set({
          permissionStatus: perm,
          gpsState: 'PERMISSION_DENIED',
          errorMessage: 'Allow location access to go online.',
        });
        return null;
      }
    }

    const geo = getGeolocationApi();
    if (!geo) {
      set({
        permissionStatus: perm,
        gpsState: 'SERVICES_DISABLED',
        errorMessage: 'Turn on location services to continue.',
      });
      return null;
    }

    const existing = get().coords;
    const hasFreshReadyFix =
      existing &&
      Date.now() - existing.timestamp < 15_000 &&
      (existing.accuracy == null || existing.accuracy <= MAX_ACCEPTABLE_GPS_ACCURACY_METERS);

    if (!hasFreshReadyFix) {
      set({
        permissionStatus: perm,
        gpsState: 'ACQUIRING',
        errorMessage: null,
      });
    } else {
      set({ permissionStatus: perm });
    }

    return new Promise<GpsFix | null>((resolve) => {
      geo.getCurrentPosition(
        (pos) => {
          const { fix, nextState, message } = classifyPosition(pos);
          set({
            permissionStatus: 'granted',
            coords: fix || get().coords,
            gpsState: nextState,
            errorMessage: message,
          });
          resolve(fix);
        },
        (err) => {
          const prevFix = get().coords;
          const { state, message } = classifyGeoError(err, prevFix);
          set({
            permissionStatus: state === 'PERMISSION_DENIED' ? 'denied' : perm,
            gpsState: state,
            errorMessage: message,
          });
          resolve(null);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: timeoutMs,
          maximumAge: highAccuracy ? 8000 : 20_000,
        },
      );
    });
  },

  startWatch: (mode = 'passive') => {
    watchConsumerCount += 1;
    const needsUpgrade = mode === 'navigation' && currentWatchMode !== 'navigation';
    if (needsUpgrade) {
      currentWatchMode = 'navigation';
    }

    const attachWatcher = async () => {
      const perm = await permissionService.check('location');
      if (perm !== 'granted' && perm !== 'limited') {
        set({
          permissionStatus: perm,
          gpsState: 'PERMISSION_DENIED',
          errorMessage: 'Enable location access',
        });
        return;
      }

      const geo = getGeolocationApi();
      if (!geo || typeof geo.watchPosition !== 'function') {
        return;
      }

      if (activeWatchId !== null && !needsUpgrade) {
        return;
      }
      if (activeWatchId !== null) {
        try {
          geo.clearWatch(activeWatchId);
        } catch {}
        activeWatchId = null;
      }

      activeWatchId = geo.watchPosition(
        (pos) => {
          const { fix, nextState, message } = classifyPosition(pos);
          set({
            permissionStatus: 'granted',
            coords: fix || get().coords,
            gpsState: nextState,
            errorMessage: message,
            isWatching: true,
          });
        },
        (err) => {
          const { state, message } = classifyGeoError(err, get().coords);
          set({
            gpsState: state,
            errorMessage: message,
          });
        },
        {
          enableHighAccuracy: currentWatchMode === 'navigation',
          timeout: currentWatchMode === 'navigation' ? 6000 : 10_000,
          maximumAge: currentWatchMode === 'navigation' ? 2000 : 12_000,
        },
      );
      set({ isWatching: true });
    };

    if (!appStateSub && Platform.OS !== 'web' && typeof AppState?.addEventListener === 'function') {
      appStateSub = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          void get().refreshLocationState({ requestPermission: false, timeoutMs: 4000 });
        }
      });
    }
    if (!webVisListener && Platform.OS === 'web' && typeof document !== 'undefined') {
      webVisListener = () => {
        if (document.visibilityState === 'visible') {
          void get().refreshLocationState({ requestPermission: false, timeoutMs: 4000 });
        }
      };
      document.addEventListener('visibilitychange', webVisListener);
    }

    void attachWatcher();
  },

  stopWatch: () => {
    watchConsumerCount = Math.max(0, watchConsumerCount - 1);
    if (watchConsumerCount > 0) return;

    currentWatchMode = 'passive';
    const geo = getGeolocationApi();
    if (activeWatchId !== null && geo && typeof geo.clearWatch === 'function') {
      try {
        geo.clearWatch(activeWatchId);
      } catch {}
    }
    activeWatchId = null;
    if (appStateSub?.remove) {
      appStateSub.remove();
      appStateSub = null;
    }
    if (webVisListener && Platform.OS === 'web' && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', webVisListener);
      webVisListener = null;
    }
    set({ isWatching: false });
  },

  resetLocationState: () => {
    set({
      gpsState: 'IDLE',
      coords: null,
      errorMessage: null,
    });
  },
}));
