import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastOptions {
  title?: string;
  duration?: number; // Duration in milliseconds. 0 = persistent until manually dismissed. Default: 3500ms
  action?: ToastAction;
}

export interface ToastPayload extends ToastOptions {
  id: string;
  message: string;
  type: ToastType;
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

    if (!resolvedMessage) return;

    const now = Date.now();
    const dedupeKey = `${resolvedType}:${resolvedMessage.trim()}`;

    const getDefaultDuration = (t: ToastType): number => {
      switch (t) {
        case 'error':
          return 4500; // 4–5s for errors needing attention
        case 'warning':
          return 3500; // ~3.5s for warnings
        case 'success':
        case 'info':
        default:
          return 2500; // 2–3s for routine success & info messages
      }
    };

    // Consecutive duplicate suppression:
    // If the identical message and type is fired within 1500ms, refresh dismiss timer without flickering UI
    if (dedupeKey === lastToastKey && now - lastToastTime < 1500) {
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

    lastToastKey = dedupeKey;
    lastToastTime = now;

    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }

    const id = `${now}_${Math.random().toString(36).substring(2, 8)}`;
    const newToast: ToastPayload = {
      id,
      message: resolvedMessage,
      type: resolvedType,
      ...resolvedOptions,
    };

    set({ currentToast: newToast });

    const duration =
      resolvedOptions.duration !== undefined
        ? resolvedOptions.duration
        : getDefaultDuration(resolvedType);
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
