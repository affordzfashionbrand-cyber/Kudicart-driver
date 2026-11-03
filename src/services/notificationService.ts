import { Platform } from 'react-native';
import { request } from '../api/client';

let currentFcmToken: string | null = null;
let unsubscribeTokenRefresh: (() => void) | null = null;
let unsubscribeOnMessage: (() => void) | null = null;

// Dynamically resolve messaging to support both native Android/iOS and web/jest environments
const getMessaging = () => {
  try {
    const messagingModule = require('@react-native-firebase/messaging');
    return messagingModule.default || messagingModule;
  } catch {
    return null;
  }
};

export const notificationService = {
  /**
   * Request push notification permissions and acquire device FCM token.
   */
  async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      const messaging = getMessaging();
      if (!messaging) {
        return null;
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus?.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus?.PROVISIONAL ||
        authStatus === 1 ||
        authStatus === 2;

      if (!enabled) {
        return null;
      }

      const token = await messaging().getToken();
      currentFcmToken = token;
      return token;
    } catch {
      return null;
    }
  },

  /**
   * Registers current device FCM token with backend /api/v1/notifications/devices/register
   */
  async registerDeviceToken(fcmToken?: string): Promise<boolean> {
    const token = fcmToken || currentFcmToken || (await this.requestPermissionAndGetToken());
    if (!token) return false;

    try {
      const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
      const res = await request<any>('/api/v1/notifications/devices/register', {
        method: 'POST',
        body: JSON.stringify({ token, platform }),
      });
      return !!(res && (res.success || res.token));
    } catch {
      return false;
    }
  },

  /**
   * Unregisters device token on logout
   */
  async unregisterDeviceToken(): Promise<boolean> {
    if (!currentFcmToken) return true;

    try {
      await request<any>('/api/v1/notifications/devices/unregister', {
        method: 'POST',
        body: JSON.stringify({ token: currentFcmToken }),
      });
      currentFcmToken = null;
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Sets up listeners for token refresh and incoming messages
   */
  setupNotificationListeners(onMessageReceived?: (message: any) => void) {
    const messaging = getMessaging();
    if (!messaging) return;

    // Listen to token refresh
    if (typeof messaging().onTokenRefresh === 'function') {
      unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken: string) => {
        currentFcmToken = newToken;
        await this.registerDeviceToken(newToken);
      });
    }

    // Foreground message handler
    if (typeof messaging().onMessage === 'function') {
      unsubscribeOnMessage = messaging().onMessage(async (remoteMessage: any) => {
        if (onMessageReceived) {
          onMessageReceived(remoteMessage);
        }
      });
    }
  },

  /**
   * Cleanup listeners on teardown
   */
  teardownListeners() {
    if (unsubscribeTokenRefresh) {
      unsubscribeTokenRefresh();
      unsubscribeTokenRefresh = null;
    }
    if (unsubscribeOnMessage) {
      unsubscribeOnMessage();
      unsubscribeOnMessage = null;
    }
  },

  getCurrentToken(): string | null {
    return currentFcmToken;
  },
};

