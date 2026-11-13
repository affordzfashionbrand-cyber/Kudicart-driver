import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  RecaptchaVerifier,
  type ConfirmationResult,
  signInWithPhoneNumber,
  signOut as fbSignOut,
  onIdTokenChanged as fbOnIdTokenChanged,
} from 'firebase/auth';

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

function formatFirebaseError(err: any): Error {
  const code = err?.code || '';
  const message = err?.message || '';
  let userMessage = message;

  if (message.includes('reCAPTCHA Timeout') || message.includes('Timeout') || code === 'auth/timeout') {
    userMessage = 'Verification took too long. Please try again.';
  } else {
    switch (code) {
      case 'auth/invalid-phone-number':
        userMessage = 'The phone number format is invalid. Please check your number.';
        break;
      case 'auth/quota-exceeded':
        userMessage = 'SMS quota exceeded for this project. Please check Firebase Console or try again later.';
        break;
      case 'auth/too-many-requests':
        userMessage = 'Too many attempts. Please wait a moment before trying again.';
        break;
      case 'auth/captcha-check-failed':
        userMessage = 'reCAPTCHA verification failed. Please try again.';
        break;
      case 'auth/invalid-verification-code':
        userMessage = 'Invalid verification code. Please check and re-enter.';
        break;
      case 'auth/code-expired':
        userMessage = 'Verification code has expired. Please request a new code.';
        break;
      case 'auth/missing-verification-code':
        userMessage = 'Please enter the verification code.';
        break;
      case 'auth/user-disabled':
        userMessage = 'This driver account has been disabled in Firebase.';
        break;
      case 'auth/network-request-failed':
        userMessage = 'Network error contacting Firebase. Please check your connection.';
        break;
      case 'auth/operation-not-allowed':
        userMessage = 'Phone authentication is disabled in Firebase Console. Please enable Phone in Firebase Authentication > Sign-in method.';
        break;
      case 'auth/unauthorized-domain':
        userMessage = 'Domain localhost is not authorized in Firebase Console. Add localhost under Firebase Authentication > Settings > Authorized domains.';
        break;
      default:
        userMessage = err?.message || 'Firebase authentication failed.';
        break;
    }
  }

  const customErr = new Error(userMessage) as Error & { code: string };
  customErr.code = code || 'FIREBASE_ERROR';
  return customErr;
}

function getEnvVar(key: string, fallback: string): string {
  // Vite injects env vars via import.meta.env at build time, but
  // import.meta is not available in CommonJS (Jest). Use Function()
  // to avoid a static SyntaxError in Jest's CJS transform.
  try {
    // eslint-disable-next-line no-new-func
    const viteVal = new Function('k', 'try { return import.meta.env[k]; } catch(e) { return undefined; }')(key);
    if (viteVal) return viteVal;
  } catch {}
  try {
    if (typeof process !== 'undefined' && process?.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch {}
  return fallback;
}

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'AIzaSyDNrOgdNcWwL4RxN9f-3Ktp7e73rSlOifc'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'kudikart-3ec2e.firebaseapp.com'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'kudikart-3ec2e'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'kudikart-3ec2e.firebasestorage.app'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '174851114581'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', '1:174851114581:web:142cf1f26ea50affe836dc'),
};

let activeRecaptchaVerifier: RecaptchaVerifier | null = null;
let activeConfirmationResult: ConfirmationResult | null = null;

function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }
  try {
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    return getAuth(app);
  } catch {
    return null;
  }
}

function getWebBridge(): Partial<FirebaseAuthBridge> | null {
  const g = globalThis as { __KUDICART_FIREBASE_AUTH__?: Partial<FirebaseAuthBridge> };
  return g.__KUDICART_FIREBASE_AUTH__ || null;
}

function ensureRecaptchaContainer(containerId = 'recaptcha-container'): void {
  if (typeof document !== 'undefined') {
    let containerEl = typeof document.getElementById === 'function' ? document.getElementById(containerId) : null;
    if (
      containerEl &&
      containerEl.childNodes &&
      containerEl.childNodes.length > 0 &&
      !activeRecaptchaVerifier &&
      typeof document.createElement === 'function'
    ) {
      try {
        const fresh = document.createElement('div');
        fresh.id = containerId;
        fresh.className = containerEl.className;
        if (containerEl.parentNode) {
          containerEl.parentNode.replaceChild(fresh, containerEl);
        } else {
          containerEl.innerHTML = '';
        }
      } catch {
        containerEl.innerHTML = '';
      }
    } else if (!containerEl && document.body && typeof document.createElement === 'function') {
      containerEl = document.createElement('div');
      containerEl.id = containerId;
      document.body.appendChild(containerEl);
    }
  }
}

export const firebaseAuthService: FirebaseAuthBridge = {
  isAvailable: () => {
    const bridge = getWebBridge();
    if (bridge?.isAvailable) {
      return Boolean(bridge.isAvailable());
    }
    return getFirebaseAuth() !== null;
  },

  hasPendingConfirmation: () => {
    const bridge = getWebBridge();
    if (bridge?.hasPendingConfirmation) {
      return Boolean(bridge.hasPendingConfirmation());
    }
    return activeConfirmationResult !== null;
  },

  clearPendingConfirmation: () => {
    const bridge = getWebBridge();
    if (bridge?.clearPendingConfirmation) {
      bridge.clearPendingConfirmation();
    }
    activeConfirmationResult = null;
    if (activeRecaptchaVerifier) {
      try {
        activeRecaptchaVerifier.clear();
      } catch {}
      activeRecaptchaVerifier = null;
    }
  },

  sendPhoneOtp: async (phoneNumber: string) => {
    const bridge = getWebBridge();
    if (bridge?.sendPhoneOtp) {
      return bridge.sendPhoneOtp(phoneNumber);
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      throw createUnavailableError('Firebase Auth is unavailable in this environment.');
    }

    const cleanDigits = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
    if (cleanDigits.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }
    const e164 = `+91${cleanDigits}`;

    ensureRecaptchaContainer('recaptcha-container');

    if (!activeRecaptchaVerifier) {
      activeRecaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          try {
            if (typeof window !== 'undefined' && (window as any).grecaptcha?.reset) {
              (window as any).grecaptcha.reset();
            }
          } catch {}
        },
      });
    }

    try {
      if (activeRecaptchaVerifier && typeof activeRecaptchaVerifier.render === 'function') {
        await activeRecaptchaVerifier.render();
      }
    } catch (renderErr: any) {
      const msg = String(renderErr?.message || renderErr);
      if (msg.includes('already been rendered')) {
        try {
          if (typeof window !== 'undefined' && (window as any).grecaptcha?.reset) {
            (window as any).grecaptcha.reset();
          }
        } catch {}
      } else {
        try {
          activeRecaptchaVerifier?.clear();
        } catch {}
        activeRecaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {},
        });
        try {
          await activeRecaptchaVerifier.render();
        } catch {}
      }
    }

    try {
      activeConfirmationResult = await signInWithPhoneNumber(auth, e164, activeRecaptchaVerifier);
      return true;
    } catch (err: any) {
      try {
        if (typeof window !== 'undefined' && (window as any).grecaptcha?.reset) {
          (window as any).grecaptcha.reset();
        }
      } catch {}
      throw formatFirebaseError(err);
    }
  },

  confirmPhoneOtp: async (otpCode: string) => {
    const bridge = getWebBridge();
    if (bridge?.confirmPhoneOtp) {
      return bridge.confirmPhoneOtp(otpCode);
    }

    if (!activeConfirmationResult) {
      throw new Error('Firebase verification session expired. Please request a new OTP.');
    }

    try {
      const result = await activeConfirmationResult.confirm(otpCode.trim());
      activeConfirmationResult = null;
      if (activeRecaptchaVerifier) {
        try {
          activeRecaptchaVerifier.clear();
        } catch {}
        activeRecaptchaVerifier = null;
      }

      const user = result.user;
      const idToken = await user.getIdToken(true);
      if (!idToken || typeof idToken !== 'string') {
        throw new Error('Failed to obtain Firebase ID token after OTP confirmation.');
      }
      return idToken;
    } catch (err: any) {
      throw formatFirebaseError(err);
    }
  },

  getFreshIdToken: async (forceRefresh = true) => {
    const bridge = getWebBridge();
    if (bridge?.getFreshIdToken) {
      return bridge.getFreshIdToken(forceRefresh);
    }
    const auth = getFirebaseAuth();
    if (!auth?.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken(forceRefresh);
    } catch {
      return null;
    }
  },

  onIdTokenChanged: (listener: (idToken: string | null) => void) => {
    const bridge = getWebBridge();
    if (bridge?.onIdTokenChanged) {
      return bridge.onIdTokenChanged(listener);
    }
    const auth = getFirebaseAuth();
    if (!auth) return () => {};
    return fbOnIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          listener(token);
        } catch {
          listener(null);
        }
      } else {
        listener(null);
      }
    });
  },

  signOut: async () => {
    const bridge = getWebBridge();
    if (bridge?.signOut) {
      await bridge.signOut();
    }
    const auth = getFirebaseAuth();
    if (auth) {
      await fbSignOut(auth).catch(() => {});
    }
  },
};
