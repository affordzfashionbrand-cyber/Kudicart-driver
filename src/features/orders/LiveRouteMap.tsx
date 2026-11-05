import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MAPS_CONFIG } from '../../config/maps';
import { fetchRoadRouteDetails } from '../../services/routingService';
import { KudiIcon } from '../../components/KudiIcon';

// Safe conditional import for react-native-maps
let NativeMapView: any = null;
let NativeMarker: any = null;
let NativePolyline: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    NativeMapView = Maps.default;
    NativeMarker = Maps.Marker;
    NativePolyline = Maps.Polyline;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn('[DriverMap] react-native-maps native module load notice:', e);
  }
}

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
  const nativeMapRef = useRef<any>(null);

  const [isStraightLine, setIsStraightLine] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    origin && destination && (origin.lat !== destination.lat || origin.lng !== destination.lng)
      ? [[origin.lat, origin.lng], [destination.lat, destination.lng]]
      : (MAPS_CONFIG.defaultRouteWaypoints as [number, number][])
  );

  // Fits complete road-following route into visible viewport
  const fitRouteBounds = (animate = false) => {
    if (Platform.OS === 'web') {
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
      } catch (e) {}
    } else {
      if (nativeMapRef.current && routeCoordinates.length > 0) {
        try {
          const coords = routeCoordinates.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
          nativeMapRef.current.fitToCoordinates(coords, {
            edgePadding: {
              top: isFullScreen ? 80 : 90,
              right: 60,
              bottom: isFullScreen ? 60 : 250,
              left: 60,
            },
            animated: animate,
          });
        } catch (e) {}
      }
    }
  };

  useImperativeHandle(ref, () => ({
    recenter: () => {
      fitRouteBounds(true);
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
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' || !NativeMapView ? (
        <View
          ref={containerRef}
          style={[styles.mapSurface, { outline: 'none' } as any]}
        />
      ) : (
        <NativeMapView
          ref={nativeMapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.mapSurface}
          initialRegion={{
            latitude: (origin.lat + destination.lat) / 2 || 12.9716,
            longitude: (origin.lng + destination.lng) / 2 || 77.6412,
            latitudeDelta: Math.max(0.02, Math.abs(origin.lat - destination.lat) * 1.5),
            longitudeDelta: Math.max(0.02, Math.abs(origin.lng - destination.lng) * 1.5),
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          toolbarEnabled={false}
        >
          {/* Origin Marker (Driver / Store) */}
          <NativeMarker
            coordinate={{ latitude: origin.lat, longitude: origin.lng }}
            title={originLabel}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.driverMarkerPin}>
              <KudiIcon name="navigation" size={18} color="#FFFFFF" />
            </View>
          </NativeMarker>

          {/* Destination Marker (Dropoff) */}
          <NativeMarker
            coordinate={{ latitude: destination.lat, longitude: destination.lng }}
            title={destinationLabel}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.destMarkerPin}>
              <KudiIcon name="home" size={18} color="#171716" />
            </View>
          </NativeMarker>

          {/* Authoritative Route Polyline */}
          {routeCoordinates.length > 1 && (
            <NativePolyline
              coordinates={routeCoordinates.map(([lat, lng]) => ({
                latitude: lat,
                longitude: lng,
              }))}
              strokeColor={isStraightLine ? '#94A3B8' : '#FF5A1F'}
              strokeWidth={isStraightLine ? 3 : 5}
              lineDashPattern={isStraightLine ? [8, 8] : undefined}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </NativeMapView>
      )}

      {/* Explicit Reference Badge when Google Road Route is unavailable */}
      {isStraightLine && (
        <View style={styles.routeReferenceBadge}>
          <Text style={styles.routeReferenceText}>Direct reference line (Road route unavailable)</Text>
        </View>
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
  },
  driverMarkerPin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#171716',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  destMarkerPin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#FF5A1F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  routeReferenceBadge: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(23, 23, 22, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 100,
  },
  routeReferenceText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
});
