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

const getApiBaseUrl = (): string => {
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
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem('kudicart_driver_token', token);
      } else {
        localStorage.removeItem('kudicart_driver_token');
      }
    }
  } catch {
    // localStorage may not be available in non-browser test runs
  }
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

const formatEndpoint = (ep: string): string => {
  const normalized = ep.startsWith('/') ? ep : `/${ep}`;
  if (normalized.startsWith('/api/v1')) return normalized;
  return `/api/v1${normalized}`;
};

export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const formattedEndpoint = formatEndpoint(endpoint);
  const url = `${API_BASE_URL}${formattedEndpoint}`;
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
