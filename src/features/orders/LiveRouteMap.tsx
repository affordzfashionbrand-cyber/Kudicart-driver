import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MAPS_CONFIG } from '../../config/maps';
import {
  fetchRoadRouteDetails,
  offsetCoordinateAhead,
  RoadRouteData,
} from '../../services/routingService';
import { isValidCoordinatePair } from '../../utils/geospatial';
import { NativeRouteMap, NativeRouteMapRef } from './NativeRouteMap';

export interface LiveRouteMapRef {
  recenter: () => void;
  centerOnUser: (coords?: Coordinates | null) => void;
  fitRoute: () => void;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface LiveRouteMapProps {
  origin?: Coordinates | null;
  destination?: Coordinates | null;
  originLabel?: string;
  destinationLabel?: string;
  isFullScreen?: boolean;
  isPreview?: boolean;
  orderId?: string;
  driverHeading?: number;
  driverSpeedMps?: number | null;
  routeCoordinates?: [number, number][];
  travelledCoordinates?: [number, number][];
  remainingCoordinates?: [number, number][];
  isRealRoute?: boolean;
  isNavigationActive?: boolean;
  isOverviewMode?: boolean;
  onRouteResolved?: (route: RoadRouteData) => void;
  onRouteStatusChange?: (status: 'IDLE' | 'LOADING' | 'READY' | 'FAILED') => void;
  onUserGesture?: () => void;
}

const PREVIEW_ORIGIN_MARKER_HTML = `
  <div style="width:30px;height:30px;border-radius:15px;background:#171716;border:2.5px solid #FFFFFF;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
    <div style="width:10px;height:10px;border-radius:5px;background:#FF5A1F;"></div>
  </div>
`;

function buildNavArrowHtml(headingDeg: number): string {
  const angle = Number.isFinite(headingDeg) ? headingDeg : 0;
  return `
    <div style="width:42px;height:42px;border-radius:21px;background:rgba(37,99,235,0.22);display:flex;align-items:center;justify-content:center;">
      <div style="width:32px;height:32px;border-radius:16px;background:#2563EB;border:3px solid #FFFFFF;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.45);transform:rotate(${angle}deg);transition:transform 0.25s linear;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round">
          <polygon points="12 2 19 21 12 17 5 21 12 2"/>
        </svg>
      </div>
    </div>
  `;
}

const DEST_MARKER_HTML = `
  <div style="width:36px;height:36px;border-radius:18px;background:#FFFFFF;border:2.5px solid #FF5A1F;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.25);">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#171716" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  </div>
`;

export const LiveRouteMap = forwardRef<LiveRouteMapRef, LiveRouteMapProps>(({
  origin,
  destination,
  originLabel = 'Your Location',
  destinationLabel = 'Destination',
  isFullScreen = false,
  isPreview = false,
  orderId,
  driverHeading = 0,
  driverSpeedMps = 0,
  routeCoordinates: externalRouteCoordinates,
  travelledCoordinates,
  remainingCoordinates,
  isRealRoute: externalIsRealRoute,
  isNavigationActive = false,
  isOverviewMode = false,
  onRouteResolved,
  onRouteStatusChange,
  onUserGesture,
}, ref) => {
  const containerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const travelledPolylineRef = useRef<any>(null);
  const originMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const nativeMapRef = useRef<NativeRouteMapRef | null>(null);

  const isProgrammaticMoveRef = useRef(false);
  const userInteractedRef = useRef(false);
  const hasFittedInitialRouteRef = useRef(false);

  const validOrigin =
    origin && isValidCoordinatePair(origin.lat, origin.lng) ? origin : null;
  const validDestination =
    destination && isValidCoordinatePair(destination.lat, destination.lng)
      ? destination
      : null;

  const originLat = validOrigin?.lat ?? null;
  const originLng = validOrigin?.lng ?? null;
  const destLat = validDestination?.lat ?? null;
  const destLng = validDestination?.lng ?? null;

  const [internalRouteCoords, setInternalRouteCoords] = useState<[number, number][]>([]);
  const [internalIsRealRoute, setInternalIsRealRoute] = useState(false);

  const activeRouteCoords =
    externalRouteCoordinates !== undefined
      ? externalIsRealRoute
        ? externalRouteCoordinates
        : []
      : internalIsRealRoute
        ? internalRouteCoords
        : [];

  const activeRemainingCoords =
    Array.isArray(remainingCoordinates) && remainingCoordinates.length >= 2
      ? remainingCoordinates
      : activeRouteCoords;

  const activeTravelledCoords =
    Array.isArray(travelledCoordinates) && travelledCoordinates.length >= 2
      ? travelledCoordinates
      : [];

  const runProgrammaticMove = useCallback((fn: () => void) => {
    isProgrammaticMoveRef.current = true;
    try {
      fn();
    } finally {
      setTimeout(() => {
        isProgrammaticMoveRef.current = false;
      }, 320);
    }
  }, []);

  const fitRouteBounds = useCallback(
    (animate = false) => {
      if (Platform.OS !== 'web' || !mapInstanceRef.current) return;
      const L = (window as any).L;
      if (!L) return;

      const paddingLeft = isPreview ? 20 : 40;
      const paddingTop = isPreview ? 20 : isNavigationActive ? 140 : isFullScreen ? 68 : 74;
      const paddingRight = isPreview ? 20 : 68;
      const paddingBottom = isPreview ? 20 : isNavigationActive ? 120 : 36;

      runProgrammaticMove(() => {
        if (polylineRef.current && activeRouteCoords.length >= 2) {
          const bounds = L.latLngBounds(activeRouteCoords.map((c) => [c[0], c[1]]));
          if (bounds.isValid()) {
            mapInstanceRef.current.fitBounds(bounds, {
              paddingTopLeft: L.point(paddingLeft, paddingTop),
              paddingBottomRight: L.point(paddingRight, paddingBottom),
              maxZoom: 16,
              animate,
            });
            return;
          }
        }
        if (destLat !== null && destLng !== null) {
          mapInstanceRef.current.setView([destLat, destLng], 15, { animate });
        } else if (originLat !== null && originLng !== null) {
          mapInstanceRef.current.setView([originLat, originLng], 15, { animate });
        }
      });
    },
    [
      activeRouteCoords,
      destLat,
      destLng,
      originLat,
      originLng,
      isPreview,
      isFullScreen,
      isNavigationActive,
      runProgrammaticMove,
    ],
  );

  const centerOnUser = useCallback(
    (customCoords?: Coordinates | null) => {
      userInteractedRef.current = false;
      const target =
        customCoords && isValidCoordinatePair(customCoords.lat, customCoords.lng)
          ? customCoords
          : originLat !== null && originLng !== null
            ? { lat: originLat, lng: originLng }
            : destLat !== null && destLng !== null
              ? { lat: destLat, lng: destLng }
              : null;

      if (!target) return;

      if (Platform.OS !== 'web') {
        nativeMapRef.current?.centerOnUser(target);
        return;
      }

      if (!mapInstanceRef.current) return;
      const ahead =
        isNavigationActive && !isOverviewMode
          ? offsetCoordinateAhead(target, driverHeading, 55)
          : target;
      const targetZoom =
        isNavigationActive && !isOverviewMode
          ? 17.5
          : Math.min(16.5, Math.max(15, Number(mapInstanceRef.current.getZoom?.()) || 15.5));

      runProgrammaticMove(() => {
        mapInstanceRef.current.flyTo([ahead.lat, ahead.lng], targetZoom, {
          duration: 0.4,
        });
      });
    },
    [
      originLat,
      originLng,
      destLat,
      destLng,
      isNavigationActive,
      isOverviewMode,
      driverHeading,
      runProgrammaticMove,
    ],
  );

  useImperativeHandle(
    ref,
    () => ({
      recenter: () => {
        userInteractedRef.current = false;
        if (Platform.OS === 'web') {
          if (isNavigationActive && !isOverviewMode && originLat !== null && originLng !== null) {
            centerOnUser({ lat: originLat, lng: originLng });
          } else {
            fitRouteBounds(true);
          }
        } else {
          nativeMapRef.current?.recenter();
        }
      },
      centerOnUser,
      fitRoute: () => {
        userInteractedRef.current = false;
        if (Platform.OS === 'web') {
          fitRouteBounds(true);
        } else {
          nativeMapRef.current?.fitRoute();
        }
      },
    }),
    [fitRouteBounds, centerOnUser, isNavigationActive, isOverviewMode, originLat, originLng],
  );

  // Standalone route lookup when external route geometry is not supplied
  useEffect(() => {
    if (externalRouteCoordinates !== undefined) {
      return;
    }
    if (originLat === null || originLng === null || destLat === null || destLng === null) {
      setInternalRouteCoords([]);
      setInternalIsRealRoute(false);
      onRouteStatusChange?.('IDLE');
      return;
    }

    let isMounted = true;
    onRouteStatusChange?.('LOADING');
    fetchRoadRouteDetails(
      { lat: originLat, lng: originLng },
      { lat: destLat, lng: destLng },
      orderId,
    ).then((res) => {
      if (!isMounted) return;
      onRouteResolved?.(res);
      if (res.isRealRoute && res.coordinates.length >= 2) {
        setInternalRouteCoords(res.coordinates);
        setInternalIsRealRoute(true);
        onRouteStatusChange?.('READY');
      } else {
        setInternalRouteCoords([]);
        setInternalIsRealRoute(false);
        onRouteStatusChange?.('FAILED');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [
    externalRouteCoordinates,
    originLat,
    originLng,
    destLat,
    destLng,
    orderId,
    onRouteResolved,
    onRouteStatusChange,
  ]);

  // Mount-once Leaflet initialization
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
        if ((containerRef.current as any)._leaflet_id) {
          delete (containerRef.current as any)._leaflet_id;
        }

        const initialLat = destLat ?? originLat ?? 12.9716;
        const initialLng = destLng ?? originLng ?? 77.5946;

        const map = L.map(containerRef.current, {
          center: [initialLat, initialLng],
          zoom: 15,
          preferCanvas: true,
          zoomControl: false,
          attributionControl: false,
          fadeAnimation: false,
          zoomAnimation: true,
          zoomSnap: 0.5,
          zoomDelta: 0.5,
          wheelPxPerZoomLevel: 80,
          inertia: true,
          bounceAtZoomLimits: false,
          dragging: !isPreview,
          scrollWheelZoom: !isPreview,
          touchZoom: !isPreview,
          doubleClickZoom: !isPreview,
          boxZoom: !isPreview,
        });

        const tileLayer = L.tileLayer(MAPS_CONFIG.googleTilesUrl, {
          subdomains: MAPS_CONFIG.googleSubdomains,
          maxZoom: 20,
          keepBuffer: 4,
          updateWhenZooming: false,
          updateWhenIdle: true,
        }).addTo(map);
        tileLayerRef.current = tileLayer;

        tileLayer.on('tileerror', () => {
          if (!tileLayer._osmSwitched) {
            tileLayer._osmSwitched = true;
            tileLayer.setUrl(MAPS_CONFIG.osmTilesUrl);
          }
        });

        const travelledPoly = L.polyline([], {
          color: '#64748B',
          weight: 4,
          opacity: 0.7,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
        travelledPolylineRef.current = travelledPoly;

        const polyline = L.polyline([], {
          color: MAPS_CONFIG.routeColor,
          weight: isPreview ? 4 : MAPS_CONFIG.routeWidth,
          opacity: 0.96,
          lineJoin: 'round',
          lineCap: 'round',
          smoothFactor: 1.5,
        }).addTo(map);
        polylineRef.current = polyline;

        map.on('dragstart zoomstart', () => {
          if (!isProgrammaticMoveRef.current) {
            userInteractedRef.current = true;
            onUserGesture?.();
          }
        });

        mapInstanceRef.current = map;
        return true;
      } catch {
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
      tileLayerRef.current = null;
      polylineRef.current = null;
      travelledPolylineRef.current = null;
      originMarkerRef.current = null;
      destMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply high-contrast dark navigation tile styling when active navigation is engaged on Web
  useEffect(() => {
    if (Platform.OS !== 'web' || !mapInstanceRef.current) return;
    const container = tileLayerRef.current?.getContainer?.();
    if (container && container.style) {
      container.style.filter =
        isNavigationActive && !isOverviewMode
          ? 'invert(92%) hue-rotate(180deg) brightness(95%) contrast(94%) saturate(80%)'
          : 'none';
      container.style.transition = 'filter 0.25s ease';
    }
    if (polylineRef.current) {
      polylineRef.current.setStyle({
        color: isNavigationActive ? '#00D8FF' : MAPS_CONFIG.routeColor,
        weight: isPreview ? 4 : isNavigationActive ? 7 : MAPS_CONFIG.routeWidth,
      });
    }
  }, [isNavigationActive, isOverviewMode, isPreview]);

  // Incrementally sync origin (with directional arrow rotation) and destination markers
  useEffect(() => {
    if (Platform.OS !== 'web' || !mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (originLat !== null && originLng !== null) {
      const html = isNavigationActive
        ? buildNavArrowHtml(driverHeading)
        : PREVIEW_ORIGIN_MARKER_HTML;
      const size: [number, number] = isNavigationActive ? [42, 42] : [30, 30];
      const anchor: [number, number] = isNavigationActive ? [21, 21] : [15, 15];

      const originIcon = L.divIcon({
        className: 'kudi-origin-marker',
        html,
        iconSize: size,
        iconAnchor: anchor,
      });

      if (!originMarkerRef.current) {
        originMarkerRef.current = L.marker([originLat, originLng], {
          icon: originIcon,
          zIndexOffset: 550,
        }).addTo(mapInstanceRef.current);
      } else {
        originMarkerRef.current.setLatLng([originLat, originLng]);
        originMarkerRef.current.setIcon(originIcon);
      }
    } else if (originMarkerRef.current) {
      mapInstanceRef.current.removeLayer(originMarkerRef.current);
      originMarkerRef.current = null;
    }

    if (destLat !== null && destLng !== null) {
      if (!destMarkerRef.current) {
        const destIcon = L.divIcon({
          className: 'kudi-dest-marker',
          html: DEST_MARKER_HTML,
          iconSize: isPreview ? [28, 28] : [36, 36],
          iconAnchor: isPreview ? [14, 14] : [18, 18],
        });
        destMarkerRef.current = L.marker([destLat, destLng], {
          icon: destIcon,
          zIndexOffset: 500,
        }).addTo(mapInstanceRef.current);
      } else {
        destMarkerRef.current.setLatLng([destLat, destLng]);
      }
    }
  }, [originLat, originLng, destLat, destLng, isPreview, isNavigationActive, driverHeading]);

  // Sync travelled & remaining polylines cleanly ONLY for verified road routes
  useEffect(() => {
    if (Platform.OS !== 'web' || !polylineRef.current || !mapInstanceRef.current) return;

    if (travelledPolylineRef.current) {
      travelledPolylineRef.current.setLatLngs(
        isNavigationActive ? activeTravelledCoords : [],
      );
    }

    if (activeRemainingCoords.length >= 2) {
      polylineRef.current.setLatLngs(activeRemainingCoords);
      if (!hasFittedInitialRouteRef.current && !userInteractedRef.current && !isNavigationActive) {
        hasFittedInitialRouteRef.current = true;
        fitRouteBounds(true);
      }
    } else {
      polylineRef.current.setLatLngs([]);
      if (
        !userInteractedRef.current &&
        destLat !== null &&
        destLng !== null &&
        !hasFittedInitialRouteRef.current &&
        !isNavigationActive
      ) {
        runProgrammaticMove(() => {
          mapInstanceRef.current?.setView([destLat, destLng], 15, { animate: false });
        });
      }
    }
  }, [
    activeRemainingCoords,
    activeTravelledCoords,
    destLat,
    destLng,
    isNavigationActive,
    fitRouteBounds,
    runProgrammaticMove,
  ]);

  useEffect(() => {
    hasFittedInitialRouteRef.current = false;
  }, [destLat, destLng]);

  // Camera follow in active navigation or overview mode on Web
  useEffect(() => {
    if (Platform.OS !== 'web' || !mapInstanceRef.current) return;
    if (isNavigationActive && isOverviewMode) {
      fitRouteBounds(true);
      return;
    }
    if (!isNavigationActive || userInteractedRef.current) return;
    if (originLat === null || originLng === null) return;

    const ahead = offsetCoordinateAhead(
      { lat: originLat, lng: originLng },
      driverHeading,
      55,
    );
    const currentZoom = Number(mapInstanceRef.current.getZoom?.()) || 15;
    runProgrammaticMove(() => {
      if (currentZoom < 16.5) {
        mapInstanceRef.current.setView([ahead.lat, ahead.lng], 17.5, { animate: true });
      } else {
        mapInstanceRef.current.panTo([ahead.lat, ahead.lng], {
          animate: true,
          duration: 0.4,
        });
      }
    });
  }, [
    isNavigationActive,
    isOverviewMode,
    originLat,
    originLng,
    driverHeading,
    fitRouteBounds,
    runProgrammaticMove,
  ]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !mapInstanceRef.current) return;
    const timer = setTimeout(() => {
      try {
        mapInstanceRef.current?.invalidateSize();
      } catch {}
    }, 150);
    return () => clearTimeout(timer);
  }, [isFullScreen, isPreview, isNavigationActive]);

  if (!validDestination && !validOrigin) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <Text style={{ color: '#65635F', fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
          Location coordinates are not yet available for this route.
        </Text>
      </View>
    );
  }

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
          origin={validOrigin}
          destination={validDestination || validOrigin!}
          originLabel={originLabel}
          destinationLabel={destinationLabel}
          isFullScreen={isFullScreen}
          isPreview={isPreview}
          orderId={orderId}
          routeCoordinates={externalRouteCoordinates}
          travelledCoordinates={travelledCoordinates}
          remainingCoordinates={remainingCoordinates}
          isRealRoute={externalIsRealRoute}
          isNavigationActive={isNavigationActive}
          isOverviewMode={isOverviewMode}
          driverHeading={driverHeading}
          driverSpeedMps={driverSpeedMps}
          onUserGesture={onUserGesture}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F1EC',
  },
  mapSurface: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
