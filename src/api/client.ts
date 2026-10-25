/**
 * KudiCart Delivery Partner — Centralized HTTP Client
 */

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export const getApiBaseUrl = (): string => {
  try {
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

export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const formattedEndpoint = formatEndpoint(endpoint);
  const url = `${baseUrl}${formattedEndpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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
    const contentType = res.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

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
