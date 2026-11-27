export interface FirebaseAuthBridge {
  isAvailable: () => boolean;
  hasPendingConfirmation: () => boolean;
  clearPendingConfirmation: () => void;
  sendPhoneOtp: (phoneNumber: string) => Promise<boolean>;
  confirmPhoneOtp: (otpCode: string) => Promise<string>;
  getFreshIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  onIdTokenChanged: (listener: (idToken: string | null) => void) => () => void;
  signOut: () => Promise<void>;
}

interface PendingConfirmationLike {
  confirm: (verificationCode: string) => Promise<{
    user?: { getIdToken: (forceRefresh?: boolean) => Promise<string> } | null;
  } | null>;
}

let pendingConfirmation: PendingConfirmationLike | null = null;

function createUnavailableError(message: string): Error & { code: string } {
  const err = new Error(message) as Error & { code: string };
  err.code = 'FIREBASE_UNAVAILABLE';
  return err;
}

function getNativeAuthInstance(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const appMod = require('@react-native-firebase/app');
    const firebaseApp = appMod?.default || appMod;
    if (firebaseApp && Array.isArray(firebaseApp.apps) && firebaseApp.apps.length === 0) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const authMod = require('@react-native-firebase/auth');
    const authFactory = authMod?.default || authMod;
    if (typeof authFactory !== 'function') {
      return null;
    }
    return authFactory();
  } catch {
    return null;
  }
}

function formatNativeFirebaseError(err: any): Error {
  const code = String(err?.code || '');
  const message = String(err?.message || '');
  let friendly = message;

  if (code === 'auth/invalid-verification-code') {
    friendly = 'Invalid OTP. Please try again.';
  } else if (code === 'auth/code-expired' || code === 'auth/session-expired') {
    friendly = 'This OTP has expired. Please request a new OTP.';
  } else if (code === 'auth/too-many-requests' || code === 'auth/quota-exceeded') {
    friendly = 'Too many attempts. Please wait a moment or request a new OTP.';
  } else if (code === 'auth/network-request-failed') {
    friendly = 'Network error contacting Firebase. Please check your connection.';
  }

  const out = new Error(friendly || 'OTP verification failed.') as Error & { code?: string };
  out.code = code || 'FIREBASE_ERROR';
  return out;
}

export const firebaseAuthService: FirebaseAuthBridge = {
  isAvailable: () => getNativeAuthInstance() !== null,

  hasPendingConfirmation: () => pendingConfirmation !== null,

  clearPendingConfirmation: () => {
    pendingConfirmation = null;
  },

  sendPhoneOtp: async (phoneNumber: string) => {
    const authInstance = getNativeAuthInstance();
    if (!authInstance) {
      throw createUnavailableError(
        'Firebase Phone Auth is not configured on this build (missing google-services.json or native module).',
      );
    }
    try {
      pendingConfirmation = await authInstance.signInWithPhoneNumber(phoneNumber);
      return true;
    } catch (err: any) {
      throw formatNativeFirebaseError(err);
    }
  },

  confirmPhoneOtp: async (otpCode: string) => {
    const trimmed = otpCode.trim();
    if (!pendingConfirmation) {
      throw new Error('Firebase verification session expired. Please request a new OTP.');
    }
    try {
      const credential = await pendingConfirmation.confirm(trimmed);
      const authInstance = getNativeAuthInstance();
      const user = credential?.user || authInstance?.currentUser;
      const idToken = await user?.getIdToken?.(true);
      if (!idToken || typeof idToken !== 'string') {
        throw new Error('Failed to retrieve Firebase ID token after OTP verification.');
      }
      pendingConfirmation = null;
      return idToken;
    } catch (err: any) {
      throw formatNativeFirebaseError(err);
    }
  },

  getFreshIdToken: async (forceRefresh = true) => {
    const authInstance = getNativeAuthInstance();
    const currentUser = authInstance?.currentUser;
    if (!currentUser || typeof currentUser.getIdToken !== 'function') {
      return null;
    }
    try {
      const token = await currentUser.getIdToken(forceRefresh);
      return typeof token === 'string' && token.length > 0 ? token : null;
    } catch {
      return null;
    }
  },

  onIdTokenChanged: (listener: (idToken: string | null) => void) => {
    const authInstance = getNativeAuthInstance();
    if (!authInstance || typeof authInstance.onIdTokenChanged !== 'function') {
      return () => {};
    }
    try {
      return authInstance.onIdTokenChanged(async (user: any) => {
        if (!user || typeof user.getIdToken !== 'function') {
          listener(null);
          return;
        }
        try {
          const token = await user.getIdToken(false);
          listener(typeof token === 'string' && token.length > 0 ? token : null);
        } catch {
          listener(null);
        }
      });
    } catch {
      return () => {};
    }
  },

  signOut: async () => {
    pendingConfirmation = null;
    const authInstance = getNativeAuthInstance();
    if (authInstance && typeof authInstance.signOut === 'function') {
      try {
        await authInstance.signOut();
      } catch {
        // Ignore if user was not signed in with Firebase
      }
    }
  },
};
