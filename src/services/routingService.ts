/**
 * KudiCart Driver App - Routing & Navigation Guidance Service
 *
 * Fetches authoritative road-following route geometry and turn-by-turn maneuver steps
 * via Google Maps Routes API from backend. Never renders straight-line fallbacks.
 */

import { getApiBaseUrl, ensureFreshAuthToken } from '../api/client';
import type { IconName } from '../components/KudiIcon.types';
import { calculateDistanceMeters } from '../utils/geospatial';

export interface Coordinates {
  lat: number;
  lng: number;
}

export type MapNavigationState =
  | 'ROUTE_PREVIEW'
  | 'LOCATION_ACQUIRING'
  | 'ROUTE_CALCULATING'
  | 'ROUTE_READY'
  | 'NAVIGATION_INITIALIZING'
  | 'NAVIGATION_ACTIVE'
  | 'ROUTE_RECALCULATING'
  | 'NAVIGATION_COMPLETED'
  | 'NAVIGATION_CANCELLED'
  | 'NAVIGATION_FAILED'
  | 'LOCATION_UNAVAILABLE'
  | 'ROUTE_FAILED';

export interface RouteManeuverStep {
  maneuver: string;
  instruction: string;
  streetName: string;
  distanceMeters: number;
  durationSeconds: number;
  startLocation: { latitude: number; longitude: number };
  endLocation: { latitude: number; longitude: number };
  coordinates: [number, number][];
}

export interface RoadRouteData {
  coordinates: [number, number][];
  steps: RouteManeuverStep[];
  isRealRoute: boolean;
  isStraightLineReference: boolean;
  routeStatus: 'READY' | 'FAILED';
  distanceKm?: string;
  distanceLabel?: string;
  distanceMeters?: number;
  durationMinutes?: number;
  durationLabel?: string;
  errorMessage?: string;
}

export interface RouteProgressMetrics {
  distanceToRouteMeters: number;
  isOffRoute: boolean;
  remainingDistanceMeters: number;
  remainingDistanceLabel: string;
  remainingDurationMinutes: number;
  formattedRemainingDuration: string;
  etaClockTime: string;
  progressRatio: number;
  hasArrived: boolean;
  travelledCoordinates: [number, number][];
  remainingCoordinates: [number, number][];
  currentStepIndex: number;
  currentStep: RouteManeuverStep | null;
  nextStep: RouteManeuverStep | null;
  distanceToManeuverMeters: number;
  distanceToManeuverLabel: string;
  currentStreetName: string;
  routeBearingDegrees: number;
}

const ROUTE_CACHE_TTL_MS = 60_000;
const routeCache = new Map<string, { data: RoadRouteData; expiresAt: number }>();
const inflightRouteRequests = new Map<string, Promise<RoadRouteData>>();

export function formatDistanceMetrics(
  rawDistanceKm?: unknown,
  distanceMeters?: number,
): { kmValue: number | null; distanceKm?: string; distanceLabel?: string; meters?: number } {
  let meters =
    typeof distanceMeters === 'number' && Number.isFinite(distanceMeters) && distanceMeters >= 0
      ? distanceMeters
      : undefined;

  let kmNum: number | null = null;
  if (typeof rawDistanceKm === 'number' && Number.isFinite(rawDistanceKm)) {
    kmNum = rawDistanceKm;
  } else if (typeof rawDistanceKm === 'string') {
    const parsed = parseFloat(rawDistanceKm.replace(/km/gi, '').trim());
    if (Number.isFinite(parsed)) {
      kmNum = parsed;
    }
  }

  if (kmNum === null && meters !== undefined) {
    kmNum = meters / 1000;
  }
  if (meters === undefined && kmNum !== null) {
    meters = Math.round(kmNum * 1000);
  }

  if (kmNum === null) {
    return { kmValue: null };
  }

  const distanceKm = kmNum.toFixed(1);
  const distanceLabel =
    meters !== undefined && meters < 1000
      ? `${Math.max(10, Math.round(meters / 10) * 10)} m`
      : `${distanceKm} km`;

  return {
    kmValue: kmNum,
    distanceKm,
    distanceLabel,
    meters,
  };
}

export function formatRemainingDistance(meters: number): string {
  const safe = Math.max(0, meters);
  if (safe < 1000) {
    return `${Math.max(10, Math.round(safe / 10) * 10)} m`;
  }
  return `${(safe / 1000).toFixed(1)} km`;
}

export function formatDurationLabel(minutes?: number | null): string {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    return '—';
  }
  const rounded = Math.max(1, Math.round(minutes));
  if (rounded < 60) {
    return `${rounded} min`;
  }
  const hrs = Math.floor(rounded / 60);
  const mins = rounded % 60;
  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}

export function formatEtaClockTime(remainingMinutes: number, nowMs = Date.now()): string {
  const arrival = new Date(nowMs + Math.max(1, remainingMinutes) * 60_000);
  const hh = String(arrival.getHours()).padStart(2, '0');
  const mm = String(arrival.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function computeBearingDegrees(from: Coordinates, to: Coordinates): number {
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function smoothBearingDegrees(
  prevDegrees: number,
  targetDegrees: number,
  alpha = 0.35,
): number {
  if (!Number.isFinite(targetDegrees)) return prevDegrees;
  if (!Number.isFinite(prevDegrees)) return targetDegrees;
  const diff = ((((targetDegrees - prevDegrees) % 360) + 540) % 360) - 180;
  return ((prevDegrees + diff * alpha) % 360 + 360) % 360;
}

/**
 * Offsets camera target ahead of the driver along heading so the directional arrow rests
 * near the lower-central viewport while showing upcoming road ahead.
 */
export function offsetCoordinateAhead(
  origin: Coordinates,
  bearingDeg: number,
  distanceMeters = 55,
): Coordinates {
  if (!Number.isFinite(bearingDeg) || distanceMeters <= 0) return origin;
  const R = 6371000;
  const angularDist = distanceMeters / R;
  const brng = (bearingDeg * Math.PI) / 180;
  const lat1 = (origin.lat * Math.PI) / 180;
  const lng1 = (origin.lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDist) +
      Math.cos(lat1) * Math.sin(angularDist) * Math.cos(brng),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(angularDist) * Math.cos(lat1),
      Math.cos(angularDist) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (lng2 * 180) / Math.PI,
  };
}

export function getManeuverIconName(maneuver?: string): IconName {
  const m = String(maneuver || '').toUpperCase();
  if (m.includes('UTURN')) return 'rotate-ccw';
  if (m.includes('FORK') || m.includes('MERGE') || m.includes('ROUNDABOUT')) return 'git-fork';
  if (m.includes('LEFT')) return 'corner-up-left';
  if (m.includes('RIGHT')) return 'corner-up-right';
  if (m.includes('ARRIVE') || m.includes('DESTINATION')) return 'navigation';
  return 'arrow-up';
}

export function decodeGooglePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

function buildRouteCacheKey(
  origin: Coordinates,
  destination: Coordinates,
  orderId?: string,
): string {
  return `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}->${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}:${orderId || 'direct'}`;
}

export function clearRouteCache() {
  routeCache.clear();
  inflightRouteRequests.clear();
}

export async function fetchRoadRouteDetails(
  origin: Coordinates,
  destination: Coordinates,
  orderId?: string,
  options?: { forceRefresh?: boolean },
): Promise<RoadRouteData> {
  const cacheKey = buildRouteCacheKey(origin, destination, orderId);

  if (!options?.forceRefresh) {
    const cached = routeCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    const existingInflight = inflightRouteRequests.get(cacheKey);
    if (existingInflight) {
      return existingInflight;
    }
  }

  const promise = (async (): Promise<RoadRouteData> => {
    const baseUrl = getApiBaseUrl();
    const token = await ensureFreshAuthToken();
    const endpoint = orderId
      ? `${baseUrl}/api/v1/orders/${encodeURIComponent(orderId)}/route`
      : `${baseUrl}/api/v1/driver/route?originLat=${encodeURIComponent(String(origin.lat))}&originLng=${encodeURIComponent(String(origin.lng))}&destLat=${encodeURIComponent(String(destination.lat))}&destLng=${encodeURIComponent(String(destination.lng))}`;

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 11_000) : null;

    try {
      const res = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        signal: controller?.signal,
      });

      if (!res.ok) {
        return {
          coordinates: [],
          steps: [],
          isRealRoute: false,
          isStraightLineReference: false,
          routeStatus: 'FAILED',
          errorMessage: 'Unable to calculate road route right now.',
        };
      }

      const raw = await res.json();
      const payload = orderId ? raw?.route || raw : raw;

      const isReal = payload?.isRealRoute === true;
      const isStraight =
        payload?.isStraightLineReference === true || payload?.routeUnavailable === true || !isReal;

      let coords: [number, number][] = [];
      if (Array.isArray(payload?.coordinates) && payload.coordinates.length > 1) {
        coords = payload.coordinates.filter(
          (pt: any) =>
            Array.isArray(pt) &&
            pt.length >= 2 &&
            typeof pt[0] === 'number' &&
            typeof pt[1] === 'number' &&
            Number.isFinite(pt[0]) &&
            Number.isFinite(pt[1]),
        );
      } else if (typeof payload?.encodedPolyline === 'string' && payload.encodedPolyline.length > 0) {
        coords = decodeGooglePolyline(payload.encodedPolyline);
      }

      if (!isReal || isStraight || coords.length < 2) {
        return {
          coordinates: [],
          steps: [],
          isRealRoute: false,
          isStraightLineReference: false,
          routeStatus: 'FAILED',
          errorMessage: 'Road route unavailable right now. Please retry.',
        };
      }

      const steps: RouteManeuverStep[] = Array.isArray(payload?.steps)
        ? payload.steps.filter(
            (s: any) => s && typeof s.instruction === 'string' && s.startLocation && s.endLocation,
          )
        : [];

      const distMetrics = formatDistanceMetrics(payload?.distanceKm, payload?.distanceMeters);
      const durationMinutes =
        typeof payload?.durationMinutes === 'number' && payload.durationMinutes > 0
          ? payload.durationMinutes
          : undefined;

      const resolved: RoadRouteData = {
        coordinates: coords,
        steps,
        isRealRoute: true,
        isStraightLineReference: false,
        routeStatus: 'READY',
        distanceKm: distMetrics.distanceKm,
        distanceLabel: distMetrics.distanceLabel,
        distanceMeters: distMetrics.meters,
        durationMinutes,
        durationLabel: formatDurationLabel(durationMinutes),
      };

      routeCache.set(cacheKey, {
        data: resolved,
        expiresAt: Date.now() + ROUTE_CACHE_TTL_MS,
      });
      return resolved;
    } catch {
      return {
        coordinates: [],
        steps: [],
        isRealRoute: false,
        isStraightLineReference: false,
        routeStatus: 'FAILED',
        errorMessage: 'Network error while calculating road route.',
      };
    } finally {
      if (timer) clearTimeout(timer);
      inflightRouteRequests.delete(cacheKey);
    }
  })();

  inflightRouteRequests.set(cacheKey, promise);
  return promise;
}

export async function fetchRoadRoute(
  origin: Coordinates,
  destination: Coordinates,
  orderId?: string,
): Promise<[number, number][]> {
  const details = await fetchRoadRouteDetails(origin, destination, orderId);
  return details.isRealRoute ? details.coordinates : [];
}

/**
 * Computes real navigation progress, travelled vs remaining geometry split, road bearing,
 * and active/next turn-by-turn maneuver guidance from actual GPS + route steps.
 */
export function calculateNavigationGuidance(params: {
  routeCoordinates: [number, number][];
  steps?: RouteManeuverStep[];
  currentPos: Coordinates;
  totalDistanceMeters?: number;
  totalDurationMinutes?: number;
  accuracyMeters?: number | null;
  arrivalRadiusMeters?: number;
  offRouteThresholdMeters?: number;
}): RouteProgressMetrics {
  const {
    routeCoordinates,
    steps = [],
    currentPos,
    totalDistanceMeters,
    totalDurationMinutes,
    accuracyMeters,
    arrivalRadiusMeters = 55,
    offRouteThresholdMeters = 65,
  } = params;

  const destPoint =
    routeCoordinates.length > 0 ? routeCoordinates[routeCoordinates.length - 1] : null;

  if (!destPoint || routeCoordinates.length < 2) {
    const mins = totalDurationMinutes ?? 1;
    return {
      distanceToRouteMeters: 0,
      isOffRoute: false,
      remainingDistanceMeters: totalDistanceMeters ?? 0,
      remainingDistanceLabel: formatRemainingDistance(totalDistanceMeters ?? 0),
      remainingDurationMinutes: mins,
      formattedRemainingDuration: formatDurationLabel(mins),
      etaClockTime: formatEtaClockTime(mins),
      progressRatio: 0,
      hasArrived: false,
      travelledCoordinates: [],
      remainingCoordinates: routeCoordinates,
      currentStepIndex: 0,
      currentStep: steps[0] || null,
      nextStep: steps[1] || null,
      distanceToManeuverMeters: steps[0]?.distanceMeters ?? totalDistanceMeters ?? 0,
      distanceToManeuverLabel: formatRemainingDistance(
        steps[0]?.distanceMeters ?? totalDistanceMeters ?? 0,
      ),
      currentStreetName: steps[0]?.streetName || '',
      routeBearingDegrees: 0,
    };
  }

  const directToDestMeters = calculateDistanceMeters(
    currentPos.lat,
    currentPos.lng,
    destPoint[0],
    destPoint[1],
  );

  const segLengths: number[] = [];
  let polylineTotalMeters = 0;
  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const segLen = calculateDistanceMeters(
      routeCoordinates[i][0],
      routeCoordinates[i][1],
      routeCoordinates[i + 1][0],
      routeCoordinates[i + 1][1],
    );
    segLengths.push(segLen);
    polylineTotalMeters += segLen;
  }

  const latRad = (currentPos.lat * Math.PI) / 180;
  const metersPerLat = 111_132;
  const metersPerLng = Math.max(1, 111_320 * Math.cos(latRad));

  let bestDistToRoute = Infinity;
  let bestDistanceAlong = 0;
  let bestSegmentIdx = 0;
  let bestProjPoint: [number, number] = routeCoordinates[0];
  let traversed = 0;

  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const a = routeCoordinates[i];
    const b = routeCoordinates[i + 1];
    const ax = (a[1] - currentPos.lng) * metersPerLng;
    const ay = (a[0] - currentPos.lat) * metersPerLat;
    const bx = (b[1] - currentPos.lng) * metersPerLng;
    const by = (b[0] - currentPos.lat) * metersPerLat;

    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    let t = 0;
    if (lenSq > 0) {
      t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lenSq));
    }
    const px = ax + t * dx;
    const py = ay + t * dy;
    const dist = Math.hypot(px, py);

    if (dist < bestDistToRoute) {
      bestDistToRoute = dist;
      bestDistanceAlong = traversed + t * segLengths[i];
      bestSegmentIdx = i;
      bestProjPoint = [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
      ];
    }
    traversed += segLengths[i];
  }

  const travelledCoordinates: [number, number][] = [
    ...routeCoordinates.slice(0, bestSegmentIdx + 1),
    bestProjPoint,
  ];
  const remainingCoordinates: [number, number][] = [
    bestProjPoint,
    ...routeCoordinates.slice(bestSegmentIdx + 1),
  ];

  const segStart = routeCoordinates[bestSegmentIdx];
  const segEnd = routeCoordinates[Math.min(bestSegmentIdx + 1, routeCoordinates.length - 1)];
  const routeBearingDegrees = computeBearingDegrees(
    { lat: segStart[0], lng: segStart[1] },
    { lat: segEnd[0], lng: segEnd[1] },
  );

  const effectiveTotal =
    typeof totalDistanceMeters === 'number' && totalDistanceMeters > 0
      ? totalDistanceMeters
      : Math.max(1, polylineTotalMeters);

  const hasArrived = directToDestMeters <= arrivalRadiusMeters;
  const progressRatio = hasArrived
    ? 1
    : polylineTotalMeters > 0
      ? Math.max(0, Math.min(1, bestDistanceAlong / polylineTotalMeters))
      : 0;

  const remainingDistanceMeters = hasArrived
    ? 0
    : Math.max(0, Math.round(effectiveTotal * (1 - progressRatio)));
  const remainingDurationMinutes = hasArrived
    ? 0
    : typeof totalDurationMinutes === 'number' && totalDurationMinutes > 0
      ? Math.max(1, Math.ceil(totalDurationMinutes * (1 - progressRatio)))
      : Math.max(1, Math.ceil(remainingDistanceMeters / 400));

  // Match current maneuver step based on cumulative step distances along the route
  let currentStepIndex = 0;
  let stepStartAlong = 0;
  let stepEndAlong = steps[0]?.distanceMeters ?? effectiveTotal;
  if (steps.length > 0) {
    let cum = 0;
    for (let sIdx = 0; sIdx < steps.length; sIdx++) {
      const sDist = Math.max(10, steps[sIdx].distanceMeters || 0);
      const nextCum = cum + sDist;
      currentStepIndex = sIdx;
      stepStartAlong = cum;
      stepEndAlong = nextCum;
      // Advance to upcoming step if driver is near the end of current step (<25m) or past it
      if (bestDistanceAlong < nextCum - 20 || sIdx === steps.length - 1) {
        break;
      }
      cum = nextCum;
    }
  }

  const currentStep = steps[currentStepIndex] || null;
  const nextStep = steps[currentStepIndex + 1] || null;

  const distanceToManeuverMeters = hasArrived
    ? 0
    : currentStep
      ? Math.max(
          0,
          Math.round(
            Math.max(
              stepEndAlong - bestDistanceAlong,
              0,
            ),
          ),
        )
      : remainingDistanceMeters;

  const hasReliableAccuracyForOffRoute =
    accuracyMeters == null || accuracyMeters <= 80;
  const isOffRoute =
    hasReliableAccuracyForOffRoute &&
    bestDistToRoute > offRouteThresholdMeters &&
    !hasArrived &&
    stepStartAlong >= 0;

  return {
    distanceToRouteMeters: Math.round(bestDistToRoute),
    isOffRoute,
    remainingDistanceMeters,
    remainingDistanceLabel: formatRemainingDistance(remainingDistanceMeters),
    remainingDurationMinutes,
    formattedRemainingDuration: formatDurationLabel(remainingDurationMinutes),
    etaClockTime: formatEtaClockTime(remainingDurationMinutes),
    progressRatio,
    hasArrived,
    travelledCoordinates,
    remainingCoordinates,
    currentStepIndex,
    currentStep,
    nextStep,
    distanceToManeuverMeters,
    distanceToManeuverLabel: formatRemainingDistance(distanceToManeuverMeters),
    currentStreetName: currentStep?.streetName || '',
    routeBearingDegrees,
  };
}

export function calculateRouteProgress(
  routeCoordinates: [number, number][],
  currentPos: Coordinates,
  totalDistanceMeters?: number,
  totalDurationMinutes?: number,
  arrivalRadiusMeters = 55,
  offRouteThresholdMeters = 65,
): RouteProgressMetrics {
  return calculateNavigationGuidance({
    routeCoordinates,
    currentPos,
    totalDistanceMeters,
    totalDurationMinutes,
    arrivalRadiusMeters,
    offRouteThresholdMeters,
  });
}
