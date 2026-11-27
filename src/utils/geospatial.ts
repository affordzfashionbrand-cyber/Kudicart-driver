export const HUB_LOGIN_RADIUS_METERS = 50;
export const MAX_ACCEPTABLE_GPS_ACCURACY_METERS = 150;

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusMeters = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
}

export function isValidCoordinatePair(
  lat?: number | null,
  lng?: number | null,
): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export type HubProximityIssue =
  | 'LOCATION_UNAVAILABLE'
  | 'POOR_ACCURACY'
  | 'HUB_UNAVAILABLE'
  | 'OUTSIDE_HUB';

export function evaluateHubProximity(params: {
  driverLat?: number | null;
  driverLng?: number | null;
  hubLat?: number | null;
  hubLng?: number | null;
  accuracyMeters?: number | null;
  maxRadiusMeters?: number;
}): {
  allowed: boolean;
  distanceMeters: number | null;
  reason?: string;
  issue?: HubProximityIssue;
} {
  const maxRadius = params.maxRadiusMeters ?? HUB_LOGIN_RADIUS_METERS;

  if (!isValidCoordinatePair(params.driverLat, params.driverLng)) {
    return {
      allowed: false,
      distanceMeters: null,
      issue: 'LOCATION_UNAVAILABLE',
      reason: 'Unable to determine your current GPS location. Please enable location access and retry.',
    };
  }

  if (
    typeof params.accuracyMeters === 'number' &&
    Number.isFinite(params.accuracyMeters) &&
    params.accuracyMeters > MAX_ACCEPTABLE_GPS_ACCURACY_METERS
  ) {
    return {
      allowed: false,
      distanceMeters: null,
      issue: 'POOR_ACCURACY',
      reason: `GPS signal is too weak (${Math.round(params.accuracyMeters)}m accuracy). Move outdoors near your hub and retry.`,
    };
  }

  if (!isValidCoordinatePair(params.hubLat, params.hubLng)) {
    return {
      allowed: false,
      distanceMeters: null,
      issue: 'HUB_UNAVAILABLE',
      reason: 'Your assigned hub coordinates are unavailable. Please contact Operations Support.',
    };
  }

  const distance = calculateDistanceMeters(
    params.driverLat!,
    params.driverLng!,
    params.hubLat!,
    params.hubLng!,
  );
  const rounded = Math.round(distance);

  if (distance > maxRadius) {
    return {
      allowed: false,
      distanceMeters: rounded,
      issue: 'OUTSIDE_HUB',
      reason: `You are ${rounded}m away from your assigned hub. Move within ${maxRadius}m of the hub to go online.`,
    };
  }

  return {
    allowed: true,
    distanceMeters: rounded,
  };
}
