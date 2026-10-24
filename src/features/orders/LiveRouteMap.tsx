import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MAPS_CONFIG } from '../../config/maps';
import { fetchRoadRoute } from '../../services/routingService';

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
}

export const LiveRouteMap = forwardRef<LiveRouteMapRef, LiveRouteMapProps>(({
  origin,
  destination,
  originLabel = 'Indiranagar Hub',
  destinationLabel = 'Flat 402, Skyline Heights',
  isFullScreen = false,
  isPreview = false,
}, ref) => {
  const containerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  const waypoints = MAPS_CONFIG.defaultRouteWaypoints;

  // Fits complete road-following route into visible viewport,
  // strictly accounting for:
  // - Top back button (top padding 85px)
  // - Right floating controls (right padding 95px)
  // - Bottom sheet (bottom padding 55px)
  // - Left screen edge (left padding 45px)
  // - Or minimal padding in preview card mode (20px)
  const fitRouteBounds = (animate = false) => {
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
  };

  useImperativeHandle(ref, () => ({
    recenter: () => {
      fitRouteBounds(true);
    },
  }));

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
          dragging: !isPreview,
          touchZoom: !isPreview,
          scrollWheelZoom: false,
          doubleClickZoom: !isPreview,
          boxZoom: !isPreview,
          keyboard: false,
        });

        // 1. Primary provider: Google Maps Platform standard road tiles
        const googleLayer = L.tileLayer(MAPS_CONFIG.googleTilesUrl, {
          maxZoom: 20,
          subdomains: MAPS_CONFIG.googleSubdomains,
          attribution: '&copy; Google Maps',
        });

        // 2. Seamless fallback: OpenStreetMap standard tiles (unmetered, open)
        const osmLayer = L.tileLayer(MAPS_CONFIG.osmTilesUrl, {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        });

        googleLayer.addTo(map);

        // Fallback smoothly to OSM if Google road tile server is unreachable
        googleLayer.on('tileerror', () => {
          if (!map.hasLayer(osmLayer)) {
            osmLayer.addTo(map);
          }
        });

        // Brand Signal Orange (#FF5A1F) route line corresponding to actual road coordinates
        const polyline = L.polyline(waypoints, {
          color: MAPS_CONFIG.routeColor,
          weight: MAPS_CONFIG.routeWidth,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);

        polylineRef.current = polyline;

        // 1. Delivery Partner (Driver) Navigation Marker ("You" in full, minimal puck in preview)
        const bikeIcon = L.divIcon({
          className: 'kudi-driver-marker',
          html: isPreview ? `
            <div style="width:30px;height:30px;border-radius:15px;background:rgba(255,90,31,0.22);border:1.5px solid #FF5A1F;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(255,90,31,0.35);">
              <div style="width:22px;height:22px;border-radius:11px;background:#171716;border:2px solid #FFFFFF;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.4);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18.5" cy="17.5" r="3.5"/>
                  <circle cx="5.5" cy="17.5" r="3.5"/>
                  <circle cx="15" cy="5" r="1"/>
                  <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                </svg>
              </div>
            </div>
          ` : `
            <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
              <div style="background:#171716;color:#FFFFFF;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;margin-bottom:4px;box-shadow:0 2px 6px rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.25);white-space:nowrap;letter-spacing:0.2px;">
                You
              </div>
              <div style="width:44px;height:44px;border-radius:22px;background:rgba(255,90,31,0.22);border:1.5px solid #FF5A1F;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(255,90,31,0.35);">
                <div style="width:32px;height:32px;border-radius:16px;background:#171716;border:2.5px solid #FFFFFF;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18.5" cy="17.5" r="3.5"/>
                    <circle cx="5.5" cy="17.5" r="3.5"/>
                    <circle cx="15" cy="5" r="1"/>
                    <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                  </svg>
                </div>
              </div>
            </div>
          `,
          iconSize: isPreview ? [30, 30] : [56, 64],
          iconAnchor: isPreview ? [15, 15] : [28, 50],
        });
        L.marker([origin.lat, origin.lng], { icon: bikeIcon, zIndexOffset: 1000 }).addTo(map);

        // 2. Customer Destination Marker ("Drop-off" in full, minimal pin in preview)
        const homeIcon = L.divIcon({
          className: 'kudi-dest-marker',
          html: isPreview ? `
            <div style="width:26px;height:26px;border-radius:13px;background:#FFFFFF;border:2px solid #FF5A1F;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25);">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#171716" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          ` : `
            <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
              <div style="background:#FFFFFF;color:#171716;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;margin-bottom:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);border:1px solid #E2DED7;white-space:nowrap;letter-spacing:0.2px;">
                Drop-off
              </div>
              <div style="width:36px;height:36px;border-radius:18px;background:#FFFFFF;border:2.5px solid #FF5A1F;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.25);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#171716" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: isPreview ? [26, 26] : [56, 58],
          iconAnchor: isPreview ? [13, 13] : [28, 44],
        });
        L.marker([destination.lat, destination.lng], { icon: homeIcon, zIndexOffset: 500 }).addTo(map);

        mapInstanceRef.current = map;

        // Automatically fit the entire route within the visible map accounting for all overlays
        const paddingLeft = isPreview ? 24 : 45;
        const paddingTop = isPreview ? 24 : (isFullScreen ? 70 : 85);
        const paddingRight = isPreview ? 24 : (isFullScreen ? 60 : 95);
        const paddingBottom = isPreview ? 24 : (isFullScreen ? 50 : 55);

        map.fitBounds(polyline.getBounds(), {
          paddingTopLeft: L.point(paddingLeft, paddingTop),
          paddingBottomRight: L.point(paddingRight, paddingBottom),
          maxZoom: 16,
        });

        return true;
      } catch (err) {
        console.warn('Map initialization error:', err);
        return false;
      }
    };

    let resizeObserver: any = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      try {
        resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
            fitRouteBounds(false);
          }
        });
        resizeObserver.observe(containerRef.current);
      } catch (e) {
        // ignore
      }
    }

    const t1 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        fitRouteBounds(false);
      }
    }, 120);

    const t2 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        fitRouteBounds(false);
      }
    }, 400);

    if (!checkAndInitLeaflet()) {
      checkInterval = setInterval(() => {
        if (checkAndInitLeaflet()) {
          clearInterval(checkInterval);
        }
      }, 50);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
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
  }, [isFullScreen, isPreview]);

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
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

  return (
    <View style={styles.container}>
      <View
        ref={containerRef}
        style={[
          styles.mapSurface,
          Platform.OS === 'web' ? ({ outline: 'none' } as any) : null,
        ]}
      />
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
