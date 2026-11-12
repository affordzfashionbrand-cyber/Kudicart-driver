/**
 * KudiCart Delivery Partner — Centralized HTTP Client
 */

declare const process: { env?: Record<string, string | undefined> } | undefined;

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export const getApiBaseUrl = (): string => {
  try {
    // eslint-disable-next-line no-new-func
    const meta = new Function('try { return import.meta; } catch(e) { return null; }')();
    if (meta && meta.env && meta.env.VITE_API_BASE_URL) {
      return meta.env.VITE_API_BASE_URL;
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) {
      return process.env.VITE_API_BASE_URL;
    }
  } catch {}

  // 2. Web browser: Dynamically resolve host (e.g. laptop LAN IP 192.168.x.x or localhost)
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol || 'http:';
    return `${protocol}//${hostname}:3001`;
  }

  // 3. Native Android environment
  // In development with USB reverse proxy (adb reverse tcp:3001 tcp:3001), 127.0.0.1:3001 forwards directly to backend.
  return 'http://127.0.0.1:3001';
};

let authToken: string | null = null;

// Safely obtain NativeTrackingModule for Android native persistence
const getNativeTrackingModule = () => {
  try {
    const RN = require('react-native');
    return RN?.NativeModules?.NativeTrackingModule || null;
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (!token) {
    lastTrackedToken = null;
    tokenObtainedAt = 0;
  } else if (lastTrackedToken !== token) {
    lastTrackedToken = token;
    tokenObtainedAt = Date.now();
  }
  // Browser localStorage persistence
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem('kudicart_driver_token', token);
      } else {
        localStorage.removeItem('kudicart_driver_token');
      }
    }
  } catch {}

  // Native Android SharedPreferences persistence
  try {
    const nativeModule = getNativeTrackingModule();
    if (nativeModule) {
      if (token) {
        nativeModule.setSecureItem('kudicart_driver_token', token).catch(() => {});
      } else {
        nativeModule.removeSecureItem('kudicart_driver_token').catch(() => {});
      }
    }
  } catch {}
};

export const getAuthToken = (): string | null => {
  if (authToken) return authToken;
  try {
    if (typeof localStorage !== 'undefined') {
      authToken = localStorage.getItem('kudicart_driver_token');
    }
  } catch {}
  return authToken;
};

export const loadStoredAuthToken = async (): Promise<string | null> => {
  if (authToken) return authToken;
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('kudicart_driver_token');
      if (stored) {
        authToken = stored;
        return stored;
      }
    }
  } catch {}

  try {
    const nativeModule = getNativeTrackingModule();
    if (nativeModule && nativeModule.getSecureItem) {
      const stored = await nativeModule.getSecureItem('kudicart_driver_token');
      if (stored) {
        authToken = stored;
        return stored;
      }
    }
  } catch {}

  return authToken;
};

const formatEndpoint = (ep: string): string => {
  const normalized = ep.startsWith('/') ? ep : `/${ep}`;
  if (normalized.startsWith('/api/v1')) return normalized;
  return `/api/v1${normalized}`;
};

export const PROACTIVE_TOKEN_REFRESH_MS = 50 * 60 * 1000;

type TokenRefreshHandler = () => Promise<string | null>;
type UnauthorizedHandler = () => void | Promise<void>;

let tokenRefreshHandler: TokenRefreshHandler | null = null;
let unauthorizedHandler: UnauthorizedHandler | null = null;
let inFlightRefreshPromise: Promise<string | null> | null = null;
let lastTrackedToken: string | null = null;
let tokenObtainedAt = 0;

export function registerTokenRefreshHandler(handler: TokenRefreshHandler | null) {
  tokenRefreshHandler = handler;
}

export function registerUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export function setAuthTokenIssuedAt(timestampMs: number) {
  lastTrackedToken = getAuthToken();
  tokenObtainedAt = lastTrackedToken ? timestampMs : 0;
}

export function resetAuthClientState() {
  lastTrackedToken = null;
  tokenObtainedAt = 0;
  inFlightRefreshPromise = null;
}

function isAuthBootstrapEndpoint(formattedEndpoint: string): boolean {
  return (
    formattedEndpoint.includes('/driver/auth/firebase/login') ||
    formattedEndpoint.includes('/driver/auth/login-firebase') ||
    formattedEndpoint.includes('/driver/auth/send-otp') ||
    formattedEndpoint.includes('/driver/auth/otp/send') ||
    formattedEndpoint.includes('/driver/auth/verify-otp') ||
    formattedEndpoint.includes('/driver/auth/otp/verify') ||
    formattedEndpoint.includes('/driver/auth/logout')
  );
}

function syncTrackedTokenTimestamp(currentToken: string | null) {
  if (!currentToken) {
    lastTrackedToken = null;
    tokenObtainedAt = 0;
    return;
  }
  if (lastTrackedToken !== currentToken) {
    lastTrackedToken = currentToken;
    tokenObtainedAt = Date.now();
  }
}

export function isAuthTokenNearExpiry(): boolean {
  const token = getAuthToken();
  syncTrackedTokenTimestamp(token);
  if (!token || tokenObtainedAt <= 0) return false;
  return Date.now() - tokenObtainedAt >= PROACTIVE_TOKEN_REFRESH_MS;
}

async function runSingleFlightRefresh(): Promise<string | null> {
  if (!tokenRefreshHandler) return null;
  if (!inFlightRefreshPromise) {
    inFlightRefreshPromise = Promise.resolve()
      .then(() => tokenRefreshHandler!())
      .then((newToken) => {
        if (newToken) {
          lastTrackedToken = newToken;
          tokenObtainedAt = Date.now();
        }
        return newToken;
      })
      .catch(() => null)
      .finally(() => {
        inFlightRefreshPromise = null;
      });
  }
  return inFlightRefreshPromise;
}

export async function ensureFreshAuthToken(forceRefresh = false): Promise<string | null> {
  let token = getAuthToken() || (await loadStoredAuthToken());
  if (!token) return null;
  syncTrackedTokenTimestamp(token);

  if (tokenRefreshHandler && (forceRefresh || isAuthTokenNearExpiry())) {
    const refreshed = await runSingleFlightRefresh();
    if (refreshed) {
      token = refreshed;
    }
  }
  return token;
}

export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const formattedEndpoint = formatEndpoint(endpoint);
  const skipAuthLifecycle = isAuthBootstrapEndpoint(formattedEndpoint);

  let activeToken = getAuthToken();
  syncTrackedTokenTimestamp(activeToken);

  if (!skipAuthLifecycle && activeToken && tokenRefreshHandler && isAuthTokenNearExpiry()) {
    const refreshed = await runSingleFlightRefresh();
    if (refreshed) {
      activeToken = refreshed;
    }
  }

  try {
    return await performSingleRequest<T>(endpoint, options, activeToken ?? undefined);
  } catch (err: any) {
    if (err?.status === 401 && !skipAuthLifecycle) {
      if (tokenRefreshHandler) {
        const refreshed = await runSingleFlightRefresh();
        if (refreshed) {
          try {
            return await performSingleRequest<T>(endpoint, options, refreshed);
          } catch (retryErr: any) {
            if (retryErr?.status === 401) {
              await unauthorizedHandler?.();
            }
            throw retryErr;
          }
        }
      }
      await unauthorizedHandler?.();
    }
    throw err;
  }
}

async function performSingleRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  overrideToken?: string,
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const formattedEndpoint = formatEndpoint(endpoint);
  const url = `${baseUrl}${formattedEndpoint}`;
  const token = overrideToken !== undefined ? overrideToken : getAuthToken();

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const contentType = res.headers?.get?.('content-type');
    const isJson = contentType && contentType.includes('application/json');
    let data: any;
    if (isJson && typeof res.json === 'function') {
      data = await res.json();
    } else if (typeof res.text === 'function') {
      const rawText = await res.text();
      try {
        data = rawText ? JSON.parse(rawText) : rawText;
      } catch {
        data = rawText;
      }
    } else if (typeof res.json === 'function') {
      data = await res.json();
    }

    if (!res.ok) {
      const errorMessage =
        (data && (data.message || data.error)) || `HTTP error ${res.status}: ${res.statusText}`;
      const err = new Error(errorMessage) as any;
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data as T;
  } catch (err: any) {
    // Return structured error
    throw err;
  }
}
