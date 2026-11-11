export const getFcmMessaging = (): any => {
  try {
    const messagingModule = require('@react-native-firebase/messaging');
    return messagingModule?.default || messagingModule || null;
  } catch {
    return null;
  }
};
