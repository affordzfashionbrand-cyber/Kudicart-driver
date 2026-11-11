import { profileApi } from '../api/profileApi';
import { driverSocket } from './driverSocket';

interface Coordinates {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
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
  private isPublishing = false;

  // Minimum displacement threshold: 25 meters (per DCR-005)
  private readonly DISPLACEMENT_THRESHOLD_METERS = 25;
  // Maximum interval between broadcasts: 15 seconds (per DCR-005)
  private readonly BROADCAST_INTERVAL_MS = 15000;

  public startTracking(orderId: string) {
    if (this.activeOrderId === orderId && (this.watchId !== null || this.intervalTimer !== null)) {
      return;
    }

    this.stopTracking();
    this.activeOrderId = orderId;

    // 1. Native / Browser Geolocation watcher if available
    const geo = typeof navigator !== 'undefined' ? navigator.geolocation : null;

    if (geo && typeof geo.watchPosition === 'function') {
      try {
        this.watchId = geo.watchPosition(
          (position) => {
            const { latitude, longitude, heading } = position.coords;
            this.handlePositionUpdate({
              latitude,
              longitude,
              heading: heading !== null && !isNaN(heading) ? heading : undefined,
            });
          },
          (error) => {
            console.warn('[DriverTracking] Geolocation watch warning:', error?.message || error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          },
        );
      } catch (err) {
        console.warn('[DriverTracking] Failed to attach watchPosition:', err);
      }
    }

    // 2. Periodic polling interval backup (12-15s cadence per DCR-005)
    this.intervalTimer = setInterval(() => {
      this.pollCurrentPosition();
    }, this.BROADCAST_INTERVAL_MS);

    // Initial immediate read
    this.pollCurrentPosition();
  }

  public stopTracking() {
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
          const { latitude, longitude, heading } = position.coords;
          this.handlePositionUpdate({
            latitude,
            longitude,
            heading: heading !== null && !isNaN(heading) ? heading : undefined,
          });
        },
        (_error) => {
          // If native GPS read fails, preserve existing position
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 },
      );
    }
  }

  private async handlePositionUpdate(coords: Coordinates) {
    if (!this.activeOrderId || this.isPublishing) return;

    const now = Date.now();
    const timeSinceLast = now - this.lastBroadcastTimestamp;

    // Check displacement from last sent coordinates
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

      // Broadcast if moved >= 25m or time exceeded 15s
      if (distance >= this.DISPLACEMENT_THRESHOLD_METERS || timeSinceLast >= this.BROADCAST_INTERVAL_MS) {
        shouldBroadcast = true;
      }
    }

    if (!shouldBroadcast) return;

    this.isPublishing = true;
    try {
      driverSocket.sendLocation(this.activeOrderId, coords);
      await profileApi.updateLocation({
        orderId: this.activeOrderId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        heading: coords.heading || 0,
        speed: coords.speed,
        accuracy: coords.accuracy,
        timestamp: coords.timestamp,
      });
      this.lastBroadcastCoords = coords;
      this.lastBroadcastTimestamp = now;
    } catch (err: any) {
      console.warn('[DriverTracking] Failed to publish location:', err?.message || err);
    } finally {
      this.isPublishing = false;
    }
  }
}

export const locationTrackingService = new LocationTrackingService();
