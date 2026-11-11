import type { ComponentType } from 'react';

/**
 * Web / Jest Sentry bridge — avoids bundling native-only RN TurboModules in react-native-web/Vite.
 */
export function initSentry(): void {
  // Web DSN capture can be attached here when browser Sentry SDK is enabled.
}

export function captureException(_error: unknown, _context?: Record<string, unknown>): void {
  // No-op on web/Jest unless browser telemetry is initialized.
}

export function wrapRootApp<P extends Record<string, any>>(
  RootComponent: ComponentType<P>,
): ComponentType<P> {
  return RootComponent;
}
