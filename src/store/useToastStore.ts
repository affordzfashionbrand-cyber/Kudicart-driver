import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastOptions {
  title?: string;
  duration?: number; // Duration in milliseconds. 0 = persistent until manually dismissed.
  action?: ToastAction;
  dedupeKey?: string;
  isBackground?: boolean;
}

export interface ToastPayload extends ToastOptions {
  id: string;
  message: string;
  type: ToastType;
  expiresAt?: number;
}

interface ToastState {
  currentToast: ToastPayload | null;
  showToast: (
    messageOrOptions: string | ({ message: string; type?: ToastType } & ToastOptions),
    type?: ToastType,
    options?: ToastOptions
  ) => void;
  hideToast: () => void;
}

let dismissTimer: ReturnType<typeof setTimeout> | null = null;
let lastToastTime = 0;
let lastToastKey = '';
let recentErrorTimestamps: number[] = [];

const DUPLICATE_SUPPRESSION_MS = 1800;
const ERROR_FLOOD_WINDOW_MS = 1200;
const MAX_ERRORS_PER_WINDOW = 2;

export function resetToastInternalState(): void {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
  lastToastTime = 0;
  lastToastKey = '';
  recentErrorTimestamps = [];
  useToastStore.setState({ currentToast: null });
}

export const useToastStore = create<ToastState>((set, get) => ({
  currentToast: null,

  showToast: (messageOrOptions, type = 'info', options = {}) => {
    let resolvedMessage: string;
    let resolvedType: ToastType = type;
    let resolvedOptions: ToastOptions = options;

    if (typeof messageOrOptions === 'object' && messageOrOptions !== null) {
      resolvedMessage = messageOrOptions.message;
      resolvedType = messageOrOptions.type || 'info';
      resolvedOptions = messageOrOptions;
    } else {
      resolvedMessage = String(messageOrOptions || '');
      resolvedType = type || 'info';
      resolvedOptions = options || {};
    }

    const trimmed = resolvedMessage.trim();
    if (!trimmed || resolvedOptions.isBackground) return;

    const now = Date.now();
    const dedupeKey = resolvedOptions.dedupeKey || `${resolvedType}:${trimmed}`;

    const getDefaultDuration = (t: ToastType): number => {
      switch (t) {
        case 'error':
          return 4500;
        case 'warning':
          return 3500;
        case 'success':
        case 'info':
        default:
          return 2500;
      }
    };

    // Consecutive duplicate suppression: refresh dismiss timer without stacking or flickering
    if (dedupeKey === lastToastKey && now - lastToastTime < DUPLICATE_SUPPRESSION_MS) {
      if (dismissTimer) {
        clearTimeout(dismissTimer);
      }
      const duration =
        resolvedOptions.duration !== undefined
          ? resolvedOptions.duration
          : getDefaultDuration(resolvedType);
      if (duration > 0) {
        dismissTimer = setTimeout(() => {
          get().hideToast();
        }, duration);
      }
      return;
    }

    // Flood guard: prevent cascading background/concurrent error bursts from flooding the UI
    if (resolvedType === 'error') {
      recentErrorTimestamps = recentErrorTimestamps.filter(
        (ts) => now - ts < ERROR_FLOOD_WINDOW_MS,
      );
      if (recentErrorTimestamps.length >= MAX_ERRORS_PER_WINDOW) {
        return;
      }
      recentErrorTimestamps.push(now);
    }

    lastToastKey = dedupeKey;
    lastToastTime = now;

    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }

    const duration =
      resolvedOptions.duration !== undefined
        ? resolvedOptions.duration
        : getDefaultDuration(resolvedType);
    const id = `${now}_${Math.random().toString(36).substring(2, 8)}`;
    const newToast: ToastPayload = {
      id,
      message: resolvedMessage,
      type: resolvedType,
      expiresAt: duration > 0 ? now + duration : undefined,
      ...resolvedOptions,
    };

    set({ currentToast: newToast });

    if (duration > 0) {
      dismissTimer = setTimeout(() => {
        get().hideToast();
      }, duration);
    }
  },

  hideToast: () => {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    set({ currentToast: null });
  },
}));

/**
 * Universal Toast API — usable from any screen, component, hook, or service
 */
export const toast = {
  show: (
    messageOrOptions: string | ({ message: string; type?: ToastType } & ToastOptions),
    type?: ToastType,
    options?: ToastOptions
  ) => {
    useToastStore.getState().showToast(messageOrOptions, type, options);
  },

  success: (message: string, options?: ToastOptions) => {
    useToastStore.getState().showToast(message, 'success', options);
  },

  error: (message: string, options?: ToastOptions) => {
    useToastStore.getState().showToast(message, 'error', options);
  },

  warning: (message: string, options?: ToastOptions) => {
    useToastStore.getState().showToast(message, 'warning', options);
  },

  info: (message: string, options?: ToastOptions) => {
    useToastStore.getState().showToast(message, 'info', options);
  },

  dismiss: () => {
    useToastStore.getState().hideToast();
  },

  hide: () => {
    useToastStore.getState().hideToast();
  },
};
