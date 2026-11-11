import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from './src/lib/queryClient';
import { RootNavigator } from './src/navigation/RootNavigator';
import { GlobalToast } from './src/components/GlobalToast';
import { ErrorBoundary } from './src/ErrorBoundary';
import { initSentry, wrapRootApp } from './src/services/sentryService';

initSentry();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider style={{ flex: 1 }}>
          <RootNavigator />
          <GlobalToast />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default wrapRootApp(App);

