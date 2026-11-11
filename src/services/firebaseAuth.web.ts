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

function createUnavailableError(message: string): Error & { code: string } {
  const err = new Error(message) as Error & { code: string };
  err.code = 'FIREBASE_UNAVAILABLE';
  return err;
}

function getWebBridge(): Partial<FirebaseAuthBridge> | null {
  const g = globalThis as { __KUDICART_FIREBASE_AUTH__?: Partial<FirebaseAuthBridge> };
  return g.__KUDICART_FIREBASE_AUTH__ || null;
}

export const firebaseAuthService: FirebaseAuthBridge = {
  isAvailable: () => {
    const bridge = getWebBridge();
    return Boolean(bridge?.isAvailable?.());
  },

  hasPendingConfirmation: () => {
    const bridge = getWebBridge();
    return Boolean(bridge?.hasPendingConfirmation?.());
  },

  clearPendingConfirmation: () => {
    getWebBridge()?.clearPendingConfirmation?.();
  },

  sendPhoneOtp: async (phoneNumber: string) => {
    const bridge = getWebBridge();
    if (bridge?.sendPhoneOtp) {
      return bridge.sendPhoneOtp(phoneNumber);
    }
    throw createUnavailableError(
      'Native Firebase Phone Auth is unavailable in web preview.',
    );
  },

  confirmPhoneOtp: async (otpCode: string) => {
    const bridge = getWebBridge();
    if (bridge?.confirmPhoneOtp) {
      return bridge.confirmPhoneOtp(otpCode);
    }
    throw createUnavailableError(
      'Native Firebase Phone Auth is unavailable in web preview.',
    );
  },

  getFreshIdToken: async (forceRefresh = true) => {
    const bridge = getWebBridge();
    if (bridge?.getFreshIdToken) {
      return bridge.getFreshIdToken(forceRefresh);
    }
    return null;
  },

  onIdTokenChanged: (listener: (idToken: string | null) => void) => {
    const bridge = getWebBridge();
    if (bridge?.onIdTokenChanged) {
      return bridge.onIdTokenChanged(listener);
    }
    return () => {};
  },

  signOut: async () => {
    const bridge = getWebBridge();
    if (bridge?.signOut) {
      await bridge.signOut();
    }
  },
};
