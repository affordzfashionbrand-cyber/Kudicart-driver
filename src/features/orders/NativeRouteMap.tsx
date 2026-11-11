import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import MapView, {
  LatLng,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { MAPS_CONFIG } from '../../config/maps';
import { fetchRoadRoute } from '../../services/routingService';

export interface NativeRouteMapCoordinates {
  lat: number;
  lng: number;
}

export interface NativeRouteMapRef {
  recenter: () => void;
}

export interface NativeRouteMapProps {
  origin: NativeRouteMapCoordinates;
  destination: NativeRouteMapCoordinates;
  originLabel?: string;
  destinationLabel?: string;
  isFullScreen?: boolean;
  isPreview?: boolean;
}

export const NativeRouteMap = forwardRef<NativeRouteMapRef, NativeRouteMapProps>(
  (
    {
      origin,
      destination,
      originLabel = 'Pickup Hub',
      destinationLabel = 'Delivery Address',
      isFullScreen = false,
      isPreview = false,
    },
    ref,
  ) => {
    const mapRef = useRef<MapView | null>(null);

    const originCoord = useMemo<LatLng>(
      () => ({ latitude: origin.lat, longitude: origin.lng }),
      [origin.lat, origin.lng],
    );

    const destinationCoord = useMemo<LatLng>(
      () => ({ latitude: destination.lat, longitude: destination.lng }),
      [destination.lat, destination.lng],
    );

    const [routeCoords, setRouteCoords] = useState<LatLng[]>([
      originCoord,
      destinationCoord,
    ]);

    useEffect(() => {
      let cancelled = false;
      setRouteCoords([originCoord, destinationCoord]);

      fetchRoadRoute(origin, destination)
        .then((waypoints) => {
          if (cancelled || !Array.isArray(waypoints) || waypoints.length < 2) {
            return;
          }
          setRouteCoords(
            waypoints.map(([latitude, longitude]) => ({ latitude, longitude })),
          );
        })
        .catch(() => {
          // Keep direct endpoint polyline if routing service is unavailable
        });

      return () => {
        cancelled = true;
      };
    }, [origin, destination, originCoord, destinationCoord]);

    const initialRegion = useMemo(() => {
      const midLat = (originCoord.latitude + destinationCoord.latitude) / 2;
      const midLng = (originCoord.longitude + destinationCoord.longitude) / 2;
      const latDelta = Math.max(
        0.015,
        Math.abs(originCoord.latitude - destinationCoord.latitude) * 1.8,
      );
      const lngDelta = Math.max(
        0.015,
        Math.abs(originCoord.longitude - destinationCoord.longitude) * 1.8,
      );
      return {
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      };
    }, [originCoord, destinationCoord]);

    const fitBounds = useCallback(
      (animated = true) => {
        if (!mapRef.current) {
          return;
        }
        const coordsToFit =
          routeCoords.length >= 2 ? routeCoords : [originCoord, destinationCoord];
        const verticalPad = isFullScreen ? 84 : 44;
        mapRef.current.fitToCoordinates(coordsToFit, {
          edgePadding: {
            top: verticalPad,
            right: 40,
            bottom: verticalPad,
            left: 40,
          },
          animated,
        });
      },
      [routeCoords, originCoord, destinationCoord, isFullScreen],
    );

    useImperativeHandle(
      ref,
      () => ({
        recenter: () => fitBounds(true),
      }),
      [fitBounds],
    );

    useEffect(() => {
      fitBounds(true);
    }, [fitBounds]);

    return (
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.mapSurface}
        initialRegion={initialRegion}
        showsUserLocation={!isPreview}
        showsMyLocationButton={!isPreview}
        showsCompass={!isPreview}
        scrollEnabled={!isPreview}
        zoomEnabled={!isPreview}
        rotateEnabled={!isPreview}
        pitchEnabled={false}
        onMapReady={() => fitBounds(false)}
      >
        <Marker
          coordinate={originCoord}
          title={originLabel}
          pinColor="#171716"
        />
        <Marker
          coordinate={destinationCoord}
          title={destinationLabel}
          pinColor="#FF5A1F"
        />
        <Polyline
          coordinates={routeCoords}
          strokeColor={MAPS_CONFIG.routeColor}
          strokeWidth={MAPS_CONFIG.routeWidth}
        />
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
});
