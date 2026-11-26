/**
 * KudiCart Driver App - Routing Service
 *
 * Fetches authoritative road-following route geometry via Google Maps Routes API from backend.
 * Replaces legacy OSRM third-party routing.
 */

import { getApiBaseUrl, ensureFreshAuthToken } from '../api/client';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteResponse {
  coordinates: [number, number][]; // [lat, lng][]
  distanceKm: string;
  durationMinutes: number;
}

/**
 * Decodes Google encoded polyline string to array of [lat, lng].
 */
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

export interface RoadRouteData {
  coordinates: [number, number][];
  isRealRoute: boolean;
  isStraightLineReference: boolean;
  distanceKm?: string;
  durationMinutes?: number;
}

export async function fetchRoadRouteDetails(
  origin: Coordinates,
  destination: Coordinates,
  orderId?: string,
): Promise<RoadRouteData> {
  // If orderId is provided, query backend route endpoint with Bearer token
  if (orderId) {
    try {
      const baseUrl = getApiBaseUrl();
      const token = await ensureFreshAuthToken();
      const res = await fetch(`${baseUrl}/api/v1/orders/${encodeURIComponent(orderId)}/route`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        const isReal = data?.route?.isRealRoute === true;
        const isStraight = data?.route?.isStraightLineReference === true || !isReal;

        if (data?.route?.coordinates && Array.isArray(data.route.coordinates) && data.route.coordinates.length > 1) {
          console.log(
            `[RoutingService] Route resolved for order ${orderId}: points=${data.route.coordinates.length}, isReal=${isReal}, distance=${data.route.distanceKm || 'N/A'}`,
          );
          return {
            coordinates: data.route.coordinates,
            isRealRoute: isReal,
            isStraightLineReference: isStraight,
            distanceKm: data.route.distanceKm,
            durationMinutes: data.route.durationMinutes,
          };
        }
        if (data?.route?.encodedPolyline) {
          const decoded = decodeGooglePolyline(data.route.encodedPolyline);
          if (decoded.length > 1) {
            console.log(
              `[RoutingService] Polyline decoded for order ${orderId}: points=${decoded.length}, isReal=${isReal}, distance=${data.route.distanceKm || 'N/A'}`,
            );
            return {
              coordinates: decoded,
              isRealRoute: isReal,
              isStraightLineReference: isStraight,
              distanceKm: data.route.distanceKm,
              durationMinutes: data.route.durationMinutes,
            };
          }
        }
      }
    } catch {}
  }

  console.warn(
    `[RoutingService] Fallback straight-line corridor active for order ${orderId || 'ad-hoc'} (real road route unavailable)`,
  );

  // Fallback: Explicit straight-line reference geometry (never fabricate fake road turns)
  const straightLine: [number, number][] = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ];

  return {
    coordinates: straightLine,
    isRealRoute: false,
    isStraightLineReference: true,
  };
}

export async function fetchRoadRoute(
  origin: Coordinates,
  destination: Coordinates,
  orderId?: string,
): Promise<[number, number][]> {
  const details = await fetchRoadRouteDetails(origin, destination, orderId);
  return details.coordinates;
}
