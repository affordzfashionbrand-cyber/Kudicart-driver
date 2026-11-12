import React, { useCallback, useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MAPS_CONFIG } from '../../config/maps';
import { fetchRoadRoute, fetchRoadRouteDetails } from '../../services/routingService';
import { NativeRouteMap, NativeRouteMapRef } from './NativeRouteMap';

export interface LiveRouteMapRef {
  recenter: () => void;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export const DEFAULT_HUB_COORDINATES = { lat: 12.9719, lng: 77.6412 };
export const DEFAULT_DEST_COORDINATES = { lat: 12.9658, lng: 77.6465 };

interface LiveRouteMapProps {
  origin: Coordinates;
  destination: Coordinates;
  originLabel?: string;
  destinationLabel?: string;
  isFullScreen?: boolean;
  isPreview?: boolean;
  orderId?: string;
  driverHeading?: number;
}

export const LiveRouteMap = forwardRef<LiveRouteMapRef, LiveRouteMapProps>(({
  origin,
  destination,
  originLabel = 'Pickup Location',
  destinationLabel = 'Customer Delivery',
  isFullScreen = false,
  isPreview = false,
  orderId,
  driverHeading = 0,
}, ref) => {
  const containerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const nativeMapRef = useRef<NativeRouteMapRef | null>(null);

  const [isStraightLine, setIsStraightLine] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    origin && destination && (origin.lat !== destination.lat || origin.lng !== destination.lng)
      ? [[origin.lat, origin.lng], [destination.lat, destination.lng]]
      : (MAPS_CONFIG.defaultRouteWaypoints as [number, number][])
  );

  // Fits complete road-following route into visible viewport,
  // strictly accounting for:
  // - Top back button (top padding 85px)
  // - Right floating controls (right padding 95px)
  // - Bottom sheet (bottom padding 55px)
  // - Left screen edge (left padding 45px)
  // - Or minimal padding in preview card mode (20px)
  const fitRouteBounds = useCallback(
    (animate = false) => {
      if (!mapInstanceRef.current || !polylineRef.current) return;
      const L = (window as any).L;
      if (!L) return;
      try {
        const paddingLeft = isPreview ? 24 : 45;
        const paddingTop = isPreview ? 24 : (isFullScreen ? 70 : 85);
        const paddingRight = isPreview ? 24 : (isFullScreen ? 60 : 95);
        const paddingBottom = isPreview ? 24 : (isFullScreen ? 50 : 55);

        mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), {
          paddingTopLeft: L.point(paddingLeft, paddingTop),
          paddingBottomRight: L.point(paddingRight, paddingBottom),
          maxZoom: 16,
          animate,
        });
      } catch (e) {
        // ignore
      }
    },
    [isFullScreen, isPreview],
  );

  useImperativeHandle(ref, () => ({
    recenter: () => {
      if (Platform.OS === 'web') {
        fitRouteBounds(true);
      } else {
        nativeMapRef.current?.recenter();
      }
    },
  }));

  // Fetch road route from backend Google Routes API
  useEffect(() => {
    let isMounted = true;
    fetchRoadRouteDetails(origin, destination, orderId).then((res) => {
      if (isMounted && res?.coordinates && res.coordinates.length > 0) {
        setRouteCoordinates(res.coordinates);
        setIsStraightLine(res.isStraightLineReference);
        if (polylineRef.current && Platform.OS === 'web') {
          polylineRef.current.setLatLngs(res.coordinates);
          polylineRef.current.setStyle({
            color: res.isStraightLineReference ? '#94A3B8' : MAPS_CONFIG.routeColor,
            dashArray: res.isStraightLineReference ? '8, 8' : undefined,
          });
          fitRouteBounds(true);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [origin.lat, origin.lng, destination.lat, destination.lng, orderId]);

  // Initial auto-fit on native map mount
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const timer = setTimeout(() => {
        fitRouteBounds(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [routeCoordinates]);

  // Web Leaflet fallback initialization
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let checkInterval: any = null;

    const checkAndInitLeaflet = () => {
      const L = (window as any).L;
      if (!L || !containerRef.current) return false;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        return true;
      }

      try {
        if (containerRef.current && (containerRef.current as any)._leaflet_id) {
          delete (containerRef.current as any)._leaflet_id;
        }

        const map = L.map(containerRef.current, {
          zoomControl: false,
          attributionControl: false,
          fadeAnimation: true,
          zoomAnimation: true,
          zoomSnap: 0.25,
        });

        L.tileLayer(MAPS_CONFIG.googleTilesUrl, {
          subdomains: MAPS_CONFIG.googleSubdomains,
          maxZoom: 20,
        }).addTo(map);

        const initialPoints = routeCoordinates.map((c) => [c[0], c[1]]);
        const polyline = L.polyline(initialPoints, {
          color: MAPS_CONFIG.routeColor,
          weight: isPreview ? 4 : MAPS_CONFIG.routeWidth,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
        polylineRef.current = polyline;

        // Origin Marker (Store / Driver)
        const originIcon = L.divIcon({
          className: 'kudi-origin-marker',
          html: `
            <div style="width:36px;height:36px;border-radius:18px;background:#171716;border:2.5px solid #FFFFFF;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
            </div>
          `,
          iconSize: isPreview ? [26, 26] : [36, 36],
          iconAnchor: isPreview ? [13, 13] : [18, 18],
        });
        L.marker([origin.lat, origin.lng], { icon: originIcon, zIndexOffset: 400 }).addTo(map);

        // Destination Marker
        const destIcon = L.divIcon({
          className: 'kudi-dest-marker',
          html: `
            <div style="width:36px;height:36px;border-radius:18px;background:#FFFFFF;border:2.5px solid #FF5A1F;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.25);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#171716" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          `,
          iconSize: isPreview ? [26, 26] : [36, 36],
          iconAnchor: isPreview ? [13, 13] : [18, 18],
        });
        L.marker([destination.lat, destination.lng], { icon: destIcon, zIndexOffset: 500 }).addTo(map);

        mapInstanceRef.current = map;
        fitRouteBounds(false);
        return true;
      } catch (err) {
        return false;
      }
    };

    if (!checkAndInitLeaflet()) {
      checkInterval = setInterval(() => {
        if (checkAndInitLeaflet()) {
          clearInterval(checkInterval);
        }
      }, 60);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // Mount-once Leaflet initialization; layout/coordinate updates are handled in effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invalidate size and refit complete route on layout or full-screen changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        try {
          mapInstanceRef.current.invalidateSize();
          fitRouteBounds(false);
        } catch (e) {
          // ignore
        }
      }, 150);
    }
  }, [isFullScreen, isPreview, fitRouteBounds]);

  // Dynamically fetch road-following route from routing service and update polyline
  useEffect(() => {
    let isMounted = true;
    fetchRoadRoute(origin, destination).then((coords) => {
      if (isMounted && coords && coords.length > 0) {
        if (polylineRef.current) {
          polylineRef.current.setLatLngs(coords);
          fitRouteBounds(true);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [origin, destination, fitRouteBounds]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' || !NativeRouteMap ? (
        <View
          ref={containerRef}
          style={[styles.mapSurface, { outline: 'none' } as any]}
        />
      ) : (
        <NativeRouteMap
          ref={nativeMapRef}
          origin={origin}
          destination={destination}
          originLabel={originLabel}
          destinationLabel={destinationLabel}
          isFullScreen={isFullScreen}
          isPreview={isPreview}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F1EC',
    position: 'relative',
    overflow: 'hidden',
  },
  mapSurface: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F1EC',
  },
});
