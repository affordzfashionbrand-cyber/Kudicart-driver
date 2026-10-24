import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { GlobalToast } from './src/components/GlobalToast';

const App = () => {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <RootNavigator />
      <GlobalToast />
    </SafeAreaProvider>
  );
};

export default App;

