import { Platform, Linking, NativeModules } from 'react-native';
import * as RN from 'react-native';

// Safe platform fallback for Android-only native APIs that do not exist in react-native-web
const PermissionsAndroid = (RN as any)?.PermissionsAndroid || null;

export type PermissionKey =
  | 'location'
  | 'backgroundLocation'
  | 'camera'
  | 'notifications'
  | 'backgroundTracking'
  | 'filePicker'
  | 'phoneDialer';

export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'never_ask_again'
  | 'not_requested'
  | 'unavailable'
  | 'limited';

export interface PermissionDetail {
  key: PermissionKey;
  title: string;
  category: string;
  description: string;
  status: PermissionStatus;
  isEssential: boolean;
  whyNeeded: string;
  platformNotes?: string;
}

const NATIVE_TRACKING = (NativeModules as any)?.NativeTrackingModule;

class PermissionService {
  /**
   * Check OS status for a single permission
   */
  public async check(key: PermissionKey): Promise<PermissionStatus> {
    if (Platform.OS === 'android') {
      return this.checkAndroid(key);
    } else if (Platform.OS === 'web') {
      return this.checkWeb(key);
    }
    return 'unavailable';
  }

  /**
   * Request OS permission
   */
  public async request(key: PermissionKey): Promise<PermissionStatus> {
    if (Platform.OS === 'android') {
      return this.requestAndroid(key);
    } else if (Platform.OS === 'web') {
      return this.requestWeb(key);
    }
    return 'unavailable';
  }

  /**
   * Check all 7 permission categories
   */
  public async checkAll(): Promise<Record<PermissionKey, PermissionDetail>> {
    const [
      locationStatus,
      bgLocationStatus,
      cameraStatus,
      notifStatus,
      bgTrackingStatus,
      filePickerStatus,
      phoneDialerStatus,
    ] = await Promise.all([
      this.check('location'),
      this.check('backgroundLocation'),
      this.check('camera'),
      this.check('notifications'),
      this.check('backgroundTracking'),
      this.check('filePicker'),
      this.check('phoneDialer'),
    ]);

    return {
      location: {
        key: 'location',
        title: 'Location access',
        category: 'Essential Service',
        description:
          "Find your live location, support delivery route navigation, verify pickup & drop-off arrival, and support tracking.",
        status: locationStatus,
        isEssential: true,
        whyNeeded:
          'Required by operations to dispatch nearby fashion orders, calculate live trip ETAs, and confirm darkstore arrivals.',
      },
      backgroundLocation: {
        key: 'backgroundLocation',
        title: 'Background location',
        category: 'Delivery Tracking',
        description:
          'Continue required delivery tracking while you temporarily switch navigation apps or lock your phone screen.',
        status: bgLocationStatus,
        isEssential: false,
        whyNeeded:
          'Maintains continuous live telemetry during an active order trip without requiring the screen to stay awake.',
        platformNotes:
          Platform.OS === 'android'
            ? 'Android 11+ requires foreground location to be granted first before enabling background access.'
            : 'Background location is restricted in web browsers and runs natively on Android.',
      },
      camera: {
        key: 'camera',
        title: 'Camera access',
        category: 'Verification & Proof',
        description:
          'Capture package photos, proof of customer delivery, return inspections, and verification selfie photos.',
        status: cameraStatus,
        isEssential: false,
        whyNeeded:
          'Enables instant shutter capture for parcel handovers, customer returns, and driver identity KYC verification.',
      },
      notifications: {
        key: 'notifications',
        title: 'Notifications',
        category: 'Alerts & Shifts',
        description:
          'Receive real-time order broadcast alerts, urgent dispatch updates, and shift confirmation reminders.',
        status: notifStatus,
        isEssential: false,
        whyNeeded:
          'Ensures you never miss high-value order assignments, flash incentive announcements, or shift schedule changes.',
        platformNotes:
          Platform.OS === 'android' && (Platform.Version as number) >= 33
            ? 'Runtime notification authorization required on Android 13+ (Tiramisu).'
            : undefined,
      },
      backgroundTracking: {
        key: 'backgroundTracking',
        title: 'Background delivery tracking',
        category: 'System Service',
        description:
          'Active tracking service continues while the app is minimized with a persistent system notification on Android.',
        status: bgTrackingStatus,
        isEssential: false,
        whyNeeded:
          'Keeps GPS active and compliant with operational delivery policies while an order is in transit.',
        platformNotes:
          Platform.OS === 'android'
            ? 'Uses Android Location Foreground Service with persistent status notification.'
            : 'Platform restricted on Web. Requires native Android application.',
      },
      filePicker: {
        key: 'filePicker',
        title: 'Photos and documents',
        category: 'System Picker',
        description:
          'Select identity documents or existing photos securely using the native system document picker.',
        status: filePickerStatus,
        isEssential: false,
        whyNeeded:
          'Directly invokes the OS Storage Access Framework or browser file dialog without requiring broad gallery permissions.',
      },
      phoneDialer: {
        key: 'phoneDialer',
        title: 'Customer calling',
        category: 'System Dialer',
        description:
          'Enable calling customers using the system phone dialer without exposing contacts or phone log permissions.',
        status: phoneDialerStatus,
        isEssential: false,
        whyNeeded:
          'Launches your default phone dialer with the customer contact pre-filled, preserving privacy and eliminating call permissions.',
      },
    } as any;
  }

  /**
   * Open system application settings
   */
  public async openSettings(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      try {
        await Linking.openSettings();
        return true;
      } catch {
        return false;
      }
    } else {
      // In web browser, cannot open OS settings directly.
      return false;
    }
  }

  /**
   * Start Native Location Foreground Service (Android only)
   */
  public async startNativeTracking(): Promise<boolean> {
    if (Platform.OS === 'android' && NATIVE_TRACKING?.startTrackingService) {
      try {
        return await NATIVE_TRACKING.startTrackingService();
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Stop Native Location Foreground Service (Android only)
   */
  public async stopNativeTracking(): Promise<boolean> {
    if (Platform.OS === 'android' && NATIVE_TRACKING?.stopTrackingService) {
      try {
        return await NATIVE_TRACKING.stopTrackingService();
      } catch {
        return false;
      }
    }
    return false;
  }

  // --- PRIVATE ANDROID IMPLEMENTATION ---

  private async checkAndroid(key: PermissionKey): Promise<PermissionStatus> {
    try {
      if (!PermissionsAndroid) return 'unavailable';

      if (key === 'location') {
        const fine = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (fine) return 'granted';
        const coarse = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        );
        if (coarse) return 'limited';
        return 'not_requested';
      }

      if (key === 'backgroundLocation') {
        const sdkVersion = Number(Platform.Version) || 0;
        if (sdkVersion < 29) {
          // Prior to Android 10, background location is granted alongside foreground
          const fine = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          return fine ? 'granted' : 'not_requested';
        }
        const bg = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
        );
        return bg ? 'granted' : 'not_requested';
      }

      if (key === 'camera') {
        const hasCamera = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        return hasCamera ? 'granted' : 'not_requested';
      }

      if (key === 'notifications') {
        const sdkVersion = Number(Platform.Version) || 0;
        if (sdkVersion >= 33 && PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS) {
          const hasNotif = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return hasNotif ? 'granted' : 'not_requested';
        }
        return 'granted';
      }

      if (key === 'backgroundTracking') {
        const fine = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (!fine) return 'not_requested';
        if (NATIVE_TRACKING?.isTrackingRunning) {
          const isRunning = await NATIVE_TRACKING.isTrackingRunning();
          return isRunning ? 'granted' : 'granted';
        }
        return 'granted';
      }

      if (key === 'filePicker' || key === 'phoneDialer') {
        return 'granted';
      }
    } catch {
      return 'denied';
    }
    return 'unavailable';
  }

  private async requestAndroid(key: PermissionKey): Promise<PermissionStatus> {
    try {
      if (!PermissionsAndroid) return 'unavailable';

      if (key === 'location') {
        const res = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'KudiCart Precise Location Access',
            message:
              'KudiCart needs high-accuracy location to calculate live route navigation, verify darkstore arrivals, and dispatch nearby delivery requests.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow Precise Location',
          }
        );
        return this.mapAndroidResult(res);
      }

      if (key === 'backgroundLocation') {
        const sdkVersion = Number(Platform.Version) || 0;
        // Android 11+ (API 30+) Staged requirement: Foreground location must be granted first!
        const fineGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (!fineGranted) {
          // Request foreground first
          const fgRes = await this.requestAndroid('location');
          if (fgRes !== 'granted') {
            return fgRes;
          }
        }

        if (sdkVersion >= 29) {
          const res = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title: 'Allow All The Time Location Access',
              message:
                'Select "Allow all the time" in device settings so delivery tracking continues seamlessly when your phone is locked or navigation is minimized.',
              buttonNeutral: 'Later',
              buttonNegative: 'Deny',
              buttonPositive: 'Configure',
            }
          );
          return this.mapAndroidResult(res);
        }
        return 'granted';
      }

      if (key === 'camera') {
        const res = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Access Required',
            message:
              'KudiCart needs your camera to photograph parcel drop-offs, return verification packages, and capture your partner KYC selfie.',
            buttonNeutral: 'Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow Camera',
          }
        );
        return this.mapAndroidResult(res);
      }

      if (key === 'notifications') {
        const sdkVersion = Number(Platform.Version) || 0;
        if (sdkVersion >= 33 && PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS) {
          const res = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Enable Order Alerts',
              message:
                'Receive immediate push notifications when urgent customer orders are assigned to your delivery route.',
              buttonNeutral: 'Later',
              buttonNegative: 'Block',
              buttonPositive: 'Enable Alerts',
            }
          );
          return this.mapAndroidResult(res);
        }
        return 'granted';
      }

      if (key === 'backgroundTracking') {
        // Trigger start of service
        await this.startNativeTracking();
        return 'granted';
      }

      if (key === 'filePicker' || key === 'phoneDialer') {
        return 'granted';
      }
    } catch {
      return 'denied';
    }
    return 'unavailable';
  }

  private mapAndroidResult(result: string): PermissionStatus {
    if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'never_ask_again';
    return 'denied';
  }

  // --- PRIVATE WEB IMPLEMENTATION ---

  private async checkWeb(key: PermissionKey): Promise<PermissionStatus> {
    if (typeof navigator === 'undefined') return 'unavailable';

    if (key === 'location') {
      try {
        if (navigator.permissions?.query) {
          const status = await navigator.permissions.query({ name: 'geolocation' });
          if (status.state === 'granted') return 'granted';
          if (status.state === 'denied') return 'never_ask_again';
          return 'not_requested';
        }
      } catch {
        // fallback
      }
      return 'not_requested';
    }

    if (key === 'camera') {
      try {
        if (navigator.permissions?.query) {
          const status = await navigator.permissions.query({ name: 'camera' as any });
          if (status.state === 'granted') return 'granted';
          if (status.state === 'denied') return 'never_ask_again';
          return 'not_requested';
        }
      } catch {
        // query for camera might not be supported in some browsers
      }
      return 'not_requested';
    }

    if (key === 'notifications') {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') return 'granted';
        if (Notification.permission === 'denied') return 'never_ask_again';
        return 'not_requested';
      }
      return 'unavailable';
    }

    if (key === 'backgroundLocation' || key === 'backgroundTracking') {
      // Browsers do not support native background foreground tracking
      return 'unavailable';
    }

    if (key === 'filePicker' || key === 'phoneDialer') {
      return 'granted';
    }

    return 'unavailable';
  }

  private async requestWeb(key: PermissionKey): Promise<PermissionStatus> {
    if (key === 'location') {
      return new Promise<PermissionStatus>((resolve) => {
        if (!navigator?.geolocation) {
          resolve('unavailable');
          return;
        }
        navigator.geolocation.getCurrentPosition(
          () => resolve('granted'),
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              resolve('never_ask_again');
            } else {
              resolve('denied');
            }
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }

    if (key === 'camera') {
      if (!navigator?.mediaDevices?.getUserMedia) {
        return 'unavailable';
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        return 'granted';
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          return 'never_ask_again';
        }
        return 'denied';
      }
    }

    if (key === 'notifications') {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const res = await Notification.requestPermission();
          if (res === 'granted') return 'granted';
          if (res === 'denied') return 'never_ask_again';
          return 'denied';
        } catch {
          return 'denied';
        }
      }
      return 'unavailable';
    }

    if (key === 'backgroundLocation' || key === 'backgroundTracking') {
      return 'unavailable';
    }

    return 'granted';
  }
}

export const permissionService = new PermissionService();
