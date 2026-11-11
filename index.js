/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

try {
  const messagingModule = require('@react-native-firebase/messaging');
  const messaging = messagingModule?.default || messagingModule;
  if (typeof messaging === 'function') {
    messaging().setBackgroundMessageHandler(async (_remoteMessage) => {
      // Background FCM message received; order and notification stores resync on resume
    });
  }
} catch {
  // Native messaging unavailable in web/test runtime
}

AppRegistry.registerComponent(appName, () => App);
