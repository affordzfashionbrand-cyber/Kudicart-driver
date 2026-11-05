import { NativeModules, Platform } from 'react-native';
import { profileApi } from '../api/profileApi';

export interface Coordinates {
  latitude: number;
  longitude: number;
  heading?: number;
  accuracy?: number;
  speed?: number;
  timestamp?: number;
}

function calculateDisplacementMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

class LocationTrackingService {
  private activeOrderId: string | null = null;
  private watchId: number | null = null;
  private intervalTimer: any = null;
  private lastBroadcastCoords: Coordinates | null = null;
  private lastBroadcastTimestamp = 0;
  private pendingCoords: Coordinates | null = null;
  private isPublishing = false;

  // Operational policy: ~15-20m displacement, 8-10s interval
  private readonly DISPLACEMENT_THRESHOLD_METERS = 15;
  private readonly BROADCAST_INTERVAL_MS = 8000;
  private readonly MAX_ACCEPTABLE_ACCURACY_METERS = 65;

  public startTracking(orderId: string) {
    if (!orderId) return;

    if (this.activeOrderId === orderId && (this.watchId !== null || this.intervalTimer !== null)) {
      return;
    }

    this.stopTracking();
    this.activeOrderId = orderId;

    // Start native Android foreground service if linked
    if (Platform.OS === 'android') {
      try {
        const NativeModule = NativeModules?.NativeTrackingModule || NativeModules?.LocationForegroundService;
        if (NativeModule && typeof NativeModule.startForegroundTracking === 'function') {
          NativeModule.startForegroundTracking(orderId);
        }
      } catch (err) {
        console.warn('[DriverTracking] Native foreground service start notice:', err);
      }
    }

    // 1. Geolocation watchPosition
    const geo = typeof navigator !== 'undefined' ? navigator.geolocation : null;
    if (geo && typeof geo.watchPosition === 'function') {
      try {
        this.watchId = geo.watchPosition(
          (position) => {
            const { latitude, longitude, heading, accuracy, speed } = position.coords;
            this.handlePositionUpdate({
              latitude,
              longitude,
              heading: heading !== null && !isNaN(heading) ? heading : undefined,
              accuracy: accuracy !== null && !isNaN(accuracy) ? accuracy : undefined,
              speed: speed !== null && !isNaN(speed) ? speed : undefined,
              timestamp: position.timestamp || Date.now(),
            });
          },
          (error) => {
            console.warn('[DriverTracking] Geolocation watch warning:', error?.message || error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 4000,
          },
        );
      } catch (err) {
        console.warn('[DriverTracking] Failed to attach watchPosition:', err);
      }
    }

    // 2. Periodic polling interval backup
    this.intervalTimer = setInterval(() => {
      this.pollCurrentPosition();
    }, this.BROADCAST_INTERVAL_MS);

    // Initial immediate read
    this.pollCurrentPosition();
  }

  public stopTracking() {
    if (Platform.OS === 'android') {
      try {
        const NativeModule = NativeModules?.NativeTrackingModule || NativeModules?.LocationForegroundService;
        if (NativeModule && typeof NativeModule.stopForegroundTracking === 'function') {
          NativeModule.stopForegroundTracking();
        }
      } catch (err) {
        console.warn('[DriverTracking] Native foreground service stop notice:', err);
      }
    }

    if (this.watchId !== null) {
      const geo = typeof navigator !== 'undefined' ? navigator.geolocation : null;
      if (geo && typeof geo.clearWatch === 'function') {
        try {
          geo.clearWatch(this.watchId);
        } catch {}
      }
      this.watchId = null;
    }

    if (this.intervalTimer !== null) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }

    this.activeOrderId = null;
    this.lastBroadcastCoords = null;
    this.pendingCoords = null;
    this.lastBroadcastTimestamp = 0;
    this.isPublishing = false;
  }

  public isTracking(): boolean {
    return this.activeOrderId !== null;
  }

  public getCurrentCoords(): Coordinates | null {
    return this.lastBroadcastCoords;
  }

  private pollCurrentPosition() {
    const geo = typeof navigator !== 'undefined' ? navigator.geolocation : null;
    if (geo && typeof geo.getCurrentPosition === 'function') {
      geo.getCurrentPosition(
        (position) => {
          const { latitude, longitude, heading, accuracy, speed } = position.coords;
          this.handlePositionUpdate({
            latitude,
            longitude,
            heading: heading !== null && !isNaN(heading) ? heading : undefined,
            accuracy: accuracy !== null && !isNaN(accuracy) ? accuracy : undefined,
            speed: speed !== null && !isNaN(speed) ? speed : undefined,
            timestamp: position.timestamp || Date.now(),
          });
        },
        () => {
          // If offline and have pending coordinates, attempt retransmission
          if (this.pendingCoords) {
            this.handlePositionUpdate(this.pendingCoords);
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 6000 },
      );
    }
  }

  private async handlePositionUpdate(coords: Coordinates) {
    if (!this.activeOrderId || this.isPublishing) return;

    // Validate coordinate range
    if (
      typeof coords.latitude !== 'number' ||
      isNaN(coords.latitude) ||
      coords.latitude < -90 ||
      coords.latitude > 90 ||
      typeof coords.longitude !== 'number' ||
      isNaN(coords.longitude) ||
      coords.longitude < -180 ||
      coords.longitude > 180
    ) {
      return;
    }

    console.log(
      `[DriverTracking] GPS acquired: accuracy=${coords.accuracy ?? 'unknown'}m, lat=${coords.latitude.toFixed(5)}, lng=${coords.longitude.toFixed(5)}, speed=${coords.speed ?? 0}m/s`,
    );

    // Discard unreasonable GPS accuracy spikes if we already have a reliable fix
    if (
      coords.accuracy &&
      coords.accuracy > this.MAX_ACCEPTABLE_ACCURACY_METERS &&
      this.lastBroadcastCoords
    ) {
      console.warn(
        `[DriverTracking] GPS accuracy ${coords.accuracy}m exceeds threshold ${this.MAX_ACCEPTABLE_ACCURACY_METERS}m; spike rejected`,
      );
      return;
    }

    const now = Date.now();
    const timeSinceLast = now - this.lastBroadcastTimestamp;

    let shouldBroadcast = false;
    if (!this.lastBroadcastCoords) {
      shouldBroadcast = true;
    } else {
      const distance = calculateDisplacementMeters(
        this.lastBroadcastCoords.latitude,
        this.lastBroadcastCoords.longitude,
        coords.latitude,
        coords.longitude,
      );

      // Broadcast if moved >= displacement threshold or elapsed broadcast interval
      if (distance >= this.DISPLACEMENT_THRESHOLD_METERS || timeSinceLast >= this.BROADCAST_INTERVAL_MS) {
        shouldBroadcast = true;
      }
    }

    if (!shouldBroadcast) return;

    this.isPublishing = true;
    try {
      await profileApi.updateLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        heading: coords.heading || 0,
        accuracy: coords.accuracy,
        speed: coords.speed,
        timestamp: coords.timestamp || now,
        orderId: this.activeOrderId,
      });

      this.lastBroadcastCoords = coords;
      this.lastBroadcastTimestamp = now;
      this.pendingCoords = null;
      console.log(
        `[DriverTracking] Location uploaded successfully for order ${this.activeOrderId} at ${new Date(now).toISOString()}`,
      );
    } catch (err: any) {
      // Network recovery buffer: retain latest coordinate for retry on next heartbeat
      this.pendingCoords = coords;
      console.warn(`[DriverTracking] Location upload delayed/failed for order ${this.activeOrderId}:`, err?.message || err);
    } finally {
      this.isPublishing = false;
    }
  }
}

export const locationTrackingService = new LocationTrackingService();
