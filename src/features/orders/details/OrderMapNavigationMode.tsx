import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';
import { LiveRouteMap, LiveRouteMapRef } from '../LiveRouteMap';
import {
  calculateNavigationGuidance,
  computeBearingDegrees,
  fetchRoadRouteDetails,
  formatDurationLabel,
  getManeuverIconName,
  RoadRouteData,
  smoothBearingDegrees,
} from '../../../services/routingService';
import { useLocationStore } from '../../../store/useLocationStore';
import { calculateDistanceMeters, isValidCoordinatePair } from '../../../utils/geospatial';
import { voiceNavigationService } from '../../../services/voiceNavigationService';

interface Coordinates {
  lat: number;
  lng: number;
}

interface OrderMapNavigationModeProps {
  order: Order;
  mapRef: React.RefObject<LiveRouteMapRef>;
  fullScreenMap: boolean;
  setFullScreenMap: (val: boolean) => void;
  onBack: () => void;
  isReturning: boolean;
  theme: any;
  onMarkArrived: () => void;
  hubCoordinates: Coordinates | null;
  destCoordinates: Coordinates | null;
}

export const OrderMapNavigationMode: React.FC<OrderMapNavigationModeProps> = ({
  order,
  mapRef,
  fullScreenMap,
  setFullScreenMap: _setFullScreenMap,
  onBack,
  isReturning,
  theme,
  onMarkArrived,
  hubCoordinates,
  destCoordinates,
}) => {
  const {
    coords: liveCoords,
    refreshLocationState,
    startWatch,
    stopWatch,
  } = useLocationStore();

  const [inAppNavActive, setInAppNavActive] = useState(false);
  const [isOverviewMode, setIsOverviewMode] = useState(false);
  const [userPannedDuringNav, setUserPannedDuringNav] = useState(false);
  const [isMuted, setIsMuted] = useState(voiceNavigationService.isMuted());
  const [routeData, setRouteData] = useState<RoadRouteData | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [smoothedHeading, setSmoothedHeading] = useState(0);

  const lastRerouteRef = useRef(0);
  const offRouteCountRef = useRef(0);
  const lastHeadingCoordRef = useRef<Coordinates | null>(null);
  const smoothedHeadingRef = useRef(0);

  const liveDriverOrigin = useMemo<Coordinates | null>(() => {
    if (liveCoords && isValidCoordinatePair(liveCoords.latitude, liveCoords.longitude)) {
      return { lat: liveCoords.latitude, lng: liveCoords.longitude };
    }
    return null;
  }, [liveCoords]);

  useEffect(() => {
    startWatch(inAppNavActive ? 'navigation' : 'passive');
    if (!liveDriverOrigin) {
      void refreshLocationState({ requestPermission: false, timeoutMs: 4500 });
    }
    return () => {
      stopWatch();
    };
  }, [inAppNavActive, liveDriverOrigin, refreshLocationState, startWatch, stopWatch]);

  useEffect(() => {
    return () => {
      voiceNavigationService.resetSession();
    };
  }, []);

  const activeOrigin = isReturning
    ? liveDriverOrigin || destCoordinates || hubCoordinates
    : liveDriverOrigin || hubCoordinates;
  const activeDestination = isReturning ? hubCoordinates : destCoordinates;

  const loadRoute = useCallback(
    async (originCoord: Coordinates, destCoord: Coordinates, forceRefresh = false) => {
      setRouteLoading(true);
      setRouteError(null);
      const res = await fetchRoadRouteDetails(
        originCoord,
        destCoord,
        isReturning ? undefined : order.id,
        { forceRefresh },
      );
      setRouteLoading(false);
      if (res.isRealRoute && res.coordinates.length >= 2) {
        setRouteData(res);
      } else {
        setRouteError(res.errorMessage || 'Road route unavailable right now.');
      }
    },
    [order.id, isReturning],
  );

  useEffect(() => {
    if (!activeOrigin || !activeDestination) return;
    if (!routeData) {
      void loadRoute(activeOrigin, activeDestination);
    }
  }, [activeOrigin, activeDestination, routeData, loadRoute]);

  const guidance = useMemo(() => {
    const pos = liveDriverOrigin || activeOrigin;
    if (!pos || !routeData?.coordinates || routeData.coordinates.length < 2) {
      return null;
    }
    return calculateNavigationGuidance({
      routeCoordinates: routeData.coordinates,
      steps: routeData.steps,
      currentPos: pos,
      totalDistanceMeters: routeData.distanceMeters,
      totalDurationMinutes: routeData.durationMinutes,
      accuracyMeters: liveCoords?.accuracy,
    });
  }, [liveDriverOrigin, activeOrigin, routeData, liveCoords?.accuracy]);

  useEffect(() => {
    const pos = liveDriverOrigin || activeOrigin;
    if (!pos) return;
    const speedMps = typeof liveCoords?.speed === 'number' ? liveCoords.speed : 0;
    const rawHeading = typeof liveCoords?.heading === 'number' ? liveCoords.heading : null;
    let nextHeading: number | null = null;

    if (speedMps >= 1.5 && rawHeading !== null && Number.isFinite(rawHeading) && rawHeading >= 0) {
      nextHeading = rawHeading;
    } else if (lastHeadingCoordRef.current) {
      const moved = calculateDistanceMeters(
        lastHeadingCoordRef.current.lat,
        lastHeadingCoordRef.current.lng,
        pos.lat,
        pos.lng,
      );
      if (moved >= 8) {
        nextHeading = computeBearingDegrees(lastHeadingCoordRef.current, pos);
        lastHeadingCoordRef.current = pos;
      }
    } else {
      lastHeadingCoordRef.current = pos;
      if (guidance?.routeBearingDegrees !== undefined) {
        nextHeading = guidance.routeBearingDegrees;
      }
    }

    if (nextHeading !== null) {
      const smooth = smoothBearingDegrees(smoothedHeadingRef.current, nextHeading, 0.4);
      smoothedHeadingRef.current = smooth;
      setSmoothedHeading(smooth);
    }
  }, [liveDriverOrigin, activeOrigin, liveCoords?.speed, liveCoords?.heading, guidance?.routeBearingDegrees]);

  useEffect(() => {
    if (!inAppNavActive || !guidance || !liveDriverOrigin || !activeDestination) return;

    if (guidance.hasArrived) {
      voiceNavigationService.announceManeuver({
        stepIndex: guidance.currentStepIndex,
        instruction: 'You have reached your destination.',
        distanceToManeuverMeters: 0,
        isArriving: true,
      });
      return;
    }

    if (guidance.currentStep) {
      voiceNavigationService.announceManeuver({
        stepIndex: guidance.currentStepIndex,
        instruction: guidance.currentStep.instruction,
        distanceToManeuverMeters: guidance.distanceToManeuverMeters,
      });
    }

    if (guidance.isOffRoute) {
      offRouteCountRef.current += 1;
      const confirmedOffRoute =
        offRouteCountRef.current >= 2 ||
        (guidance.distanceToRouteMeters > 110 &&
          (liveCoords?.accuracy == null || liveCoords.accuracy <= 50));
      if (confirmedOffRoute && Date.now() - lastRerouteRef.current > 10_000) {
        lastRerouteRef.current = Date.now();
        offRouteCountRef.current = 0;
        void loadRoute(liveDriverOrigin, activeDestination, true);
      }
    } else {
      offRouteCountRef.current = 0;
    }
  }, [inAppNavActive, guidance, liveDriverOrigin, activeDestination, liveCoords?.accuracy, loadRoute]);

  const handleToggleNavigation = () => {
    if (inAppNavActive) {
      setInAppNavActive(false);
      setIsOverviewMode(false);
      setUserPannedDuringNav(false);
      voiceNavigationService.resetSession();
      mapRef.current?.fitRoute();
      return;
    }
    if (!routeData?.isRealRoute) return;
    setInAppNavActive(true);
    setIsOverviewMode(false);
    setUserPannedDuringNav(false);
    voiceNavigationService.resetSession();
    mapRef.current?.centerOnUser(activeOrigin);
  };

  const handleCenterOnUser = () => {
    setUserPannedDuringNav(false);
    setIsOverviewMode(false);
    if (liveDriverOrigin) {
      mapRef.current?.centerOnUser(liveDriverOrigin);
    } else {
      void refreshLocationState({ requestPermission: true, timeoutMs: 5000 }).then((fix) => {
        if (fix) {
          mapRef.current?.centerOnUser({ lat: fix.latitude, lng: fix.longitude });
        } else {
          mapRef.current?.recenter();
        }
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.canvas }}>
      {/* MAP BACKGROUND */}
      <View style={[StyleSheet.absoluteFillObject, !fullScreenMap && { bottom: inAppNavActive ? 145 : 225 }]}>
        <LiveRouteMap
          ref={mapRef}
          origin={activeOrigin}
          destination={activeDestination}
          originLabel={liveDriverOrigin ? 'Your Location' : order.pickupLocation}
          destinationLabel={isReturning ? order.pickupLocation : order.customerAddress}
          isFullScreen={fullScreenMap || inAppNavActive}
          orderId={order.id}
          routeCoordinates={routeData?.coordinates}
          travelledCoordinates={guidance?.travelledCoordinates}
          remainingCoordinates={guidance?.remainingCoordinates}
          isRealRoute={Boolean(routeData?.isRealRoute)}
          isNavigationActive={inAppNavActive}
          isOverviewMode={isOverviewMode}
          driverHeading={smoothedHeading}
          driverSpeedMps={liveCoords?.speed}
          onUserGesture={() => {
            if (inAppNavActive) setUserPannedDuringNav(true);
          }}
        />
      </View>

      {/* ACTIVE NAVIGATION TURN-BY-TURN TOP BANNER vs PREVIEW FLOATING HEADER */}
      {inAppNavActive ? (
        <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 25, pointerEvents: 'box-none' }}>
          <View style={{ padding: 12 }}>
            <View
              style={{
                backgroundColor: '#0D5C43',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                elevation: 6,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.14)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <KudiIcon
                  name={getManeuverIconName(guidance?.currentStep?.maneuver)}
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#A7F3D0' }}>
                  {guidance?.distanceToManeuverLabel || 'Continue'}
                </Text>
                <Text style={{ fontSize: 15.5, fontWeight: '700', color: '#FFFFFF' }} numberOfLines={2}>
                  {guidance?.currentStep?.instruction ||
                    (isReturning ? `Head to ${order.pickupLocation}` : `Head to ${order.customerName}`)}
                </Text>
              </View>
            </View>

            {guidance?.nextStep ? (
              <View
                style={{
                  marginTop: 6,
                  alignSelf: 'flex-start',
                  backgroundColor: '#094230',
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#D1FAE5' }}>Then</Text>
                <KudiIcon
                  name={getManeuverIconName(guidance.nextStep.maneuver)}
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }} numberOfLines={1}>
                  {guidance.nextStep.streetName}
                </Text>
              </View>
            ) : null}

            {routeLoading && (
              <View
                style={{
                  marginTop: 6,
                  alignSelf: 'flex-start',
                  backgroundColor: '#1E293B',
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>
                  Recalculating route...
                </Text>
              </View>
            )}
          </View>

          <View style={{ position: 'absolute', right: 12, top: 132, gap: 10 }}>
            <TouchableOpacity
              style={orderNavStyles.navCtrlBtn}
              onPress={() => {
                const next = !isMuted;
                setIsMuted(next);
                voiceNavigationService.setMuted(next);
              }}
              accessibilityLabel={isMuted ? 'Unmute voice guidance' : 'Mute voice guidance'}
            >
              <KudiIcon name={isMuted ? 'volume-x' : 'volume-2'} size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                orderNavStyles.navCtrlBtn,
                isOverviewMode && { backgroundColor: '#2563EB' },
              ]}
              onPress={() => {
                const next = !isOverviewMode;
                setIsOverviewMode(next);
                if (next) mapRef.current?.fitRoute();
                else mapRef.current?.centerOnUser(activeOrigin);
              }}
              accessibilityLabel="Toggle route overview"
            >
              <KudiIcon name={isOverviewMode ? 'navigation' : 'map'} size={18} color="#FFFFFF" />
            </TouchableOpacity>
            {(userPannedDuringNav || isOverviewMode) && (
              <TouchableOpacity
                style={[orderNavStyles.navCtrlBtn, { backgroundColor: '#2563EB' }]}
                onPress={handleCenterOnUser}
                accessibilityLabel="Re-centre map"
              >
                <KudiIcon name="crosshair" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView
          style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'box-none' }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <TouchableOpacity
              style={orderNavStyles.circleBtn}
              onPress={onBack}
              accessibilityLabel="Back"
            >
              <KudiIcon name="arrow-left" size={22} color="#171716" />
            </TouchableOpacity>

            {routeLoading ? (
              <View style={orderNavStyles.pill}>
                <ActivityIndicator size="small" color="#FF5A1F" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#171716' }}>
                  Calculating route...
                </Text>
              </View>
            ) : routeError ? (
              <TouchableOpacity
                onPress={() => {
                  if (activeOrigin && activeDestination) {
                    void loadRoute(activeOrigin, activeDestination, true);
                  }
                }}
                style={[orderNavStyles.pill, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}
              >
                <KudiIcon name="alert-circle" size={14} color="#B45309" />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#92400E' }}>
                  Route unavailable · Retry
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={orderNavStyles.circleBtn}
              onPress={handleCenterOnUser}
              accessibilityRole="button"
              accessibilityLabel="Center map on current location"
            >
              <KudiIcon name="crosshair" size={20} color="#FF5A1F" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* BOTTOM ACTION SHEET */}
      {!fullScreenMap && (
        <View
          style={[
            orderNavStyles.bottomSheet,
            inAppNavActive && {
              backgroundColor: '#111315',
              borderColor: '#272A2E',
              paddingBottom: Platform.OS === 'ios' ? 28 : 16,
            },
          ]}
        >
          {inAppNavActive ? (
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity
                  style={orderNavStyles.navCtrlBtn}
                  onPress={handleToggleNavigation}
                  accessibilityLabel="Exit navigation"
                >
                  <KudiIcon name="close" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#4ADE80' }}>
                    {guidance?.formattedRemainingDuration || formatDurationLabel(routeData?.durationMinutes)}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#D1D5DB' }}>
                    {guidance
                      ? `${guidance.remainingDistanceLabel} · ${guidance.etaClockTime}`
                      : routeData?.distanceLabel || '—'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#FF5A1F',
                    paddingHorizontal: 16,
                    height: 44,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    voiceNavigationService.resetSession();
                    onMarkArrived();
                  }}
                  accessibilityLabel={isReturning ? 'Mark arrived at store' : 'Mark Arrived'}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                    {isReturning
                      ? 'At Store'
                      : order.isTryAndBuy
                        ? 'Arrived · Try & Buy'
                        : 'Mark Arrived'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={{ alignItems: 'center', marginBottom: 10 }}>
                <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#E2DED7' }} />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#171716' }}>
                  {isReturning ? 'Returning to store' : 'On the way'}
                </Text>
                {routeData?.isRealRoute && (
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#16805A' }}>
                    {routeData.distanceLabel || '—'} · {formatDurationLabel(routeData.durationMinutes)}
                  </Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: '#FFF0E8',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    marginTop: 2,
                  }}
                >
                  <KudiIcon name={isReturning ? 'home' : 'navigation'} size={18} color="#FF5A1F" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#171716', lineHeight: 21 }}>
                    {isReturning ? order.pickupLocation : order.customerAddress}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#65635F', marginTop: 3 }}>
                    {isReturning
                      ? order.isTryAndBuy && order.returnManifestId
                        ? `Return Bay • Manifest ${order.returnManifestId}`
                        : 'Store location'
                      : order.customerName}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1.5,
                    borderColor: '#FF5A1F',
                    opacity: !routeData?.isRealRoute ? 0.5 : 1,
                    height: 48,
                    borderRadius: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  disabled={!routeData?.isRealRoute}
                  onPress={handleToggleNavigation}
                  accessibilityLabel="Start navigation"
                >
                  <KudiIcon name="navigation" size={17} color="#FF5A1F" />
                  <Text style={{ color: '#FF5A1F', fontSize: 14, fontWeight: '700' }}>
                    Start Navigation
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1.15,
                    backgroundColor: '#FF5A1F',
                    height: 48,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={onMarkArrived}
                  accessibilityLabel={isReturning ? 'Mark arrived at store' : 'Mark Arrived'}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                    {isReturning
                      ? 'At Store'
                      : order.isTryAndBuy
                        ? 'Arrived · Start Try & Buy'
                        : 'Mark Arrived'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const orderNavStyles = StyleSheet.create({
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2DED7',
    elevation: 3,
  },
  navCtrlBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(17, 19, 21, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: '#E2DED7',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 18,
    elevation: 10,
  },
});
