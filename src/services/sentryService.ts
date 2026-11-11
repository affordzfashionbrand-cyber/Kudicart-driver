import * as Sentry from '@sentry/react-native';
import type { ComponentType } from 'react';

let sentryInitialized = false;

function readSentryDsn(): string {
  try {
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } })?.process
      ?.env;
    if (env) {
      return env.SENTRY_DSN || env.VITE_SENTRY_DSN || '';
    }
  } catch {
    // Ignore env read errors
  }
  return '';
}

export function initSentry(): void {
  if (sentryInitialized) {
    return;
  }
  const dsn = readSentryDsn();
  if (!dsn) {
    return;
  }
  Sentry.init({
    dsn,
    enabled: true,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  });
  sentryInitialized = true;
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!sentryInitialized) {
    return;
  }
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

export function wrapRootApp<P extends Record<string, any>>(
  RootComponent: ComponentType<P>,
): ComponentType<P> {
  return Sentry.wrap(RootComponent);
}
