import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, {
  LatLng,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { KudiIcon } from '../../components/KudiIcon';
import { MAPS_CONFIG } from '../../config/maps';
import {
  fetchRoadRouteDetails,
  offsetCoordinateAhead,
} from '../../services/routingService';

export interface NativeRouteMapCoordinates {
  lat: number;
  lng: number;
}

export interface NativeRouteMapRef {
  recenter: () => void;
  centerOnUser: (coords?: NativeRouteMapCoordinates | null) => void;
  fitRoute: () => void;
}

export interface NativeRouteMapProps {
  origin?: NativeRouteMapCoordinates | null;
  destination: NativeRouteMapCoordinates;
  originLabel?: string;
  destinationLabel?: string;
  isFullScreen?: boolean;
  isPreview?: boolean;
  orderId?: string;
  routeCoordinates?: [number, number][];
  travelledCoordinates?: [number, number][];
  remainingCoordinates?: [number, number][];
  isRealRoute?: boolean;
  isNavigationActive?: boolean;
  isOverviewMode?: boolean;
  driverHeading?: number;
  driverSpeedMps?: number | null;
  onUserGesture?: () => void;
}

// High-contrast dark vector style aligned with active navigation readability
const DARK_NAVIGATION_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#142030' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9FB3C8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0F1824' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#243447' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#2E435A' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#395572' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0C1622' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#162925' }],
  },
];

export const NativeRouteMap = forwardRef<NativeRouteMapRef, NativeRouteMapProps>(
  (
    {
      origin,
      destination,
      originLabel = 'Your Location',
      destinationLabel = 'Destination',
      isFullScreen = false,
      isPreview = false,
      orderId,
      routeCoordinates: externalRouteCoordinates,
      travelledCoordinates,
      remainingCoordinates,
      isRealRoute: externalIsRealRoute,
      isNavigationActive = false,
      isOverviewMode = false,
      driverHeading = 0,
      driverSpeedMps = 0,
      onUserGesture,
    },
    ref,
  ) => {
    const mapRef = useRef<MapView | null>(null);
    const hasAutoFittedRef = useRef(false);
    const userPausedFollowRef = useRef(false);

    const originLat = origin?.lat ?? null;
    const originLng = origin?.lng ?? null;
    const destLat = destination.lat;
    const destLng = destination.lng;

    const originCoord = useMemo<LatLng | null>(
      () =>
        originLat !== null && originLng !== null
          ? { latitude: originLat, longitude: originLng }
          : null,
      [originLat, originLng],
    );

    const destinationCoord = useMemo<LatLng>(
      () => ({ latitude: destLat, longitude: destLng }),
      [destLat, destLng],
    );

    const [internalRouteCoords, setInternalRouteCoords] = useState<LatLng[]>([]);
    const [internalIsRealRoute, setInternalIsRealRoute] = useState(false);

    useEffect(() => {
      if (externalRouteCoordinates !== undefined) {
        return;
      }
      if (originLat === null || originLng === null) {
        setInternalRouteCoords([]);
        setInternalIsRealRoute(false);
        return;
      }

      let cancelled = false;
      fetchRoadRouteDetails(
        { lat: originLat, lng: originLng },
        { lat: destLat, lng: destLng },
        orderId,
      )
        .then((res) => {
          if (cancelled) return;
          if (res.isRealRoute && res.coordinates.length >= 2) {
            setInternalRouteCoords(
              res.coordinates.map(([latitude, longitude]) => ({ latitude, longitude })),
            );
            setInternalIsRealRoute(true);
          } else {
            setInternalRouteCoords([]);
            setInternalIsRealRoute(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setInternalRouteCoords([]);
            setInternalIsRealRoute(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [externalRouteCoordinates, originLat, originLng, destLat, destLng, orderId]);

    const activeRouteCoords = useMemo<LatLng[]>(() => {
      if (externalRouteCoordinates !== undefined) {
        if (!externalIsRealRoute || externalRouteCoordinates.length < 2) {
          return [];
        }
        return externalRouteCoordinates.map(([latitude, longitude]) => ({
          latitude,
          longitude,
        }));
      }
      return internalIsRealRoute ? internalRouteCoords : [];
    }, [externalRouteCoordinates, externalIsRealRoute, internalIsRealRoute, internalRouteCoords]);

    const travelledLatLngs = useMemo<LatLng[]>(
      () =>
        Array.isArray(travelledCoordinates) && travelledCoordinates.length >= 2
          ? travelledCoordinates.map(([latitude, longitude]) => ({ latitude, longitude }))
          : [],
      [travelledCoordinates],
    );

    const remainingLatLngs = useMemo<LatLng[]>(
      () =>
        Array.isArray(remainingCoordinates) && remainingCoordinates.length >= 2
          ? remainingCoordinates.map(([latitude, longitude]) => ({ latitude, longitude }))
          : activeRouteCoords,
      [remainingCoordinates, activeRouteCoords],
    );

    const initialRegion = useMemo(() => {
      const center = originCoord || destinationCoord;
      return {
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
    }, [originCoord, destinationCoord]);

    const getDynamicNavZoom = useCallback(() => {
      const kmh = typeof driverSpeedMps === 'number' && driverSpeedMps > 0 ? driverSpeedMps * 3.6 : 0;
      if (kmh > 50) return 16.8;
      if (kmh > 25) return 17.5;
      return 18.0;
    }, [driverSpeedMps]);

    const getDriverPerspectiveCamera = useCallback(
      (targetCoord: LatLng) => {
        const heading = Number.isFinite(driverHeading) ? driverHeading : 0;
        const ahead = offsetCoordinateAhead(
          { lat: targetCoord.latitude, lng: targetCoord.longitude },
          heading,
          55,
        );
        return {
          center: { latitude: ahead.lat, longitude: ahead.lng },
          zoom: getDynamicNavZoom(),
          heading,
          pitch: 56,
        };
      },
      [driverHeading, getDynamicNavZoom],
    );

    const fitBounds = useCallback(
      (animated = true) => {
        if (!mapRef.current) return;
        const coordsToFit =
          activeRouteCoords.length >= 2
            ? activeRouteCoords
            : originCoord
              ? [originCoord, destinationCoord]
              : null;

        if (coordsToFit && coordsToFit.length >= 2) {
          const verticalPad = isFullScreen ? 110 : 56;
          mapRef.current.fitToCoordinates(coordsToFit, {
            edgePadding: {
              top: verticalPad,
              right: 52,
              bottom: verticalPad,
              left: 52,
            },
            animated,
          });
        } else {
          mapRef.current.animateToRegion(
            {
              latitude: destinationCoord.latitude,
              longitude: destinationCoord.longitude,
              latitudeDelta: 0.012,
              longitudeDelta: 0.012,
            },
            animated ? 350 : 0,
          );
        }
      },
      [activeRouteCoords, originCoord, destinationCoord, isFullScreen],
    );

    const centerOnUser = useCallback(
      (customCoords?: NativeRouteMapCoordinates | null) => {
        if (!mapRef.current) return;
        userPausedFollowRef.current = false;
        const target = customCoords
          ? { latitude: customCoords.lat, longitude: customCoords.lng }
          : originCoord || destinationCoord;

        if (isNavigationActive && !isOverviewMode) {
          mapRef.current.animateCamera(getDriverPerspectiveCamera(target), { duration: 450 });
        } else {
          mapRef.current.animateCamera(
            {
              center: target,
              zoom: 16,
              heading: 0,
              pitch: 0,
            },
            { duration: 400 },
          );
        }
      },
      [originCoord, destinationCoord, isNavigationActive, isOverviewMode, getDriverPerspectiveCamera],
    );

    useImperativeHandle(
      ref,
      () => ({
        recenter: () => {
          userPausedFollowRef.current = false;
          if (isNavigationActive && !isOverviewMode && originCoord) {
            centerOnUser({ lat: originCoord.latitude, lng: originCoord.longitude });
          } else {
            fitBounds(true);
          }
        },
        centerOnUser,
        fitRoute: () => {
          userPausedFollowRef.current = false;
          fitBounds(true);
        },
      }),
      [fitBounds, centerOnUser, isNavigationActive, isOverviewMode, originCoord],
    );

    useEffect(() => {
      if (activeRouteCoords.length >= 2 && !hasAutoFittedRef.current) {
        hasAutoFittedRef.current = true;
        fitBounds(false);
      }
    }, [activeRouteCoords.length, fitBounds]);

    useEffect(() => {
      hasAutoFittedRef.current = false;
    }, [destLat, destLng]);

    // Switch between 3D driver perspective and full-route overview smoothly
    useEffect(() => {
      if (!mapRef.current) return;
      if (isNavigationActive && isOverviewMode) {
        fitBounds(true);
        return;
      }
      if (!isNavigationActive) {
        userPausedFollowRef.current = false;
        return;
      }
      if (!originCoord || userPausedFollowRef.current) {
        return;
      }
      mapRef.current.animateCamera(getDriverPerspectiveCamera(originCoord), {
        duration: 500,
      });
    }, [
      isNavigationActive,
      isOverviewMode,
      originCoord,
      getDriverPerspectiveCamera,
      fitBounds,
    ]);

    return (
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.mapSurface}
        initialRegion={initialRegion}
        customMapStyle={isNavigationActive && !isOverviewMode ? DARK_NAVIGATION_MAP_STYLE : undefined}
        showsBuildings={true}
        showsTraffic={isNavigationActive}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        scrollEnabled={!isPreview}
        zoomEnabled={!isPreview}
        rotateEnabled={!isPreview}
        pitchEnabled={!isPreview}
        onPanDrag={() => {
          if (!isPreview) {
            userPausedFollowRef.current = true;
            onUserGesture?.();
          }
        }}
        onMapReady={() => {
          if (!hasAutoFittedRef.current) {
            fitBounds(false);
          }
        }}
      >
        {originCoord && (
          <Marker
            coordinate={originCoord}
            title={originLabel}
            flat={isNavigationActive}
            rotation={isNavigationActive ? driverHeading : 0}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View
              style={
                isNavigationActive
                  ? styles.navArrowMarkerOuter
                  : styles.previewOriginMarkerOuter
              }
            >
              {isNavigationActive ? (
                <KudiIcon name="navigation" size={18} color="#FFFFFF" />
              ) : (
                <View style={styles.previewOriginInnerDot} />
              )}
            </View>
          </Marker>
        )}

        <Marker
          coordinate={destinationCoord}
          title={destinationLabel}
          pinColor="#FF5A1F"
        />

        {travelledLatLngs.length >= 2 && isNavigationActive && (
          <Polyline
            coordinates={travelledLatLngs}
            strokeColor="#64748B"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {remainingLatLngs.length >= 2 && (
          <Polyline
            coordinates={remainingLatLngs}
            strokeColor={isNavigationActive ? '#00D8FF' : MAPS_CONFIG.routeColor}
            strokeWidth={isPreview ? 4 : isNavigationActive ? 7 : MAPS_CONFIG.routeWidth}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>
    );
  },
);

const styles = StyleSheet.create({
  mapSurface: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  navArrowMarkerOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  previewOriginMarkerOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#171716',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  previewOriginInnerDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FF5A1F',
  },
});
