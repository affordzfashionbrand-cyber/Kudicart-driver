import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { KudiIcon } from '../../components/KudiIcon';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { LiveRouteMap, LiveRouteMapRef } from '../orders/LiveRouteMap';
import {
  calculateNavigationGuidance,
  computeBearingDegrees,
  Coordinates,
  fetchRoadRouteDetails,
  formatDurationLabel,
  getManeuverIconName,
  MapNavigationState,
  RoadRouteData,
  smoothBearingDegrees,
} from '../../services/routingService';
import { useLocationStore } from '../../store/useLocationStore';
import { calculateDistanceMeters, isValidCoordinatePair } from '../../utils/geospatial';
import { permissionService } from '../../services/permissionService';
import { voiceNavigationService } from '../../services/voiceNavigationService';

export const InAppMapScreen = ({ navigation, route }: any) => {
  const {
    title = 'Route Preview',
    destinationLabel = 'Destination',
    destinationAddress = '',
    destination: rawDestination = null,
    origin: rawOrigin = null,
    orderId,
  } = route?.params || {};

  const mapRef = useRef<LiveRouteMapRef>(null);
  const lastRerouteAtRef = useRef<number>(0);
  const offRouteCountRef = useRef<number>(0);
  const lastHeadingCoordRef = useRef<Coordinates | null>(null);
  const smoothedHeadingRef = useRef<number>(0);

  const destination: Coordinates | null = useMemo(() => {
    if (rawDestination && isValidCoordinatePair(rawDestination.lat, rawDestination.lng)) {
      return { lat: rawDestination.lat, lng: rawDestination.lng };
    }
    return null;
  }, [rawDestination]);

  const fallbackOrigin: Coordinates | null = useMemo(() => {
    if (rawOrigin && isValidCoordinatePair(rawOrigin.lat, rawOrigin.lng)) {
      return { lat: rawOrigin.lat, lng: rawOrigin.lng };
    }
    return null;
  }, [rawOrigin]);

  const {
    gpsState,
    coords: liveCoords,
    refreshLocationState,
    startWatch,
    stopWatch,
  } = useLocationStore();

  const driverOrigin: Coordinates | null = useMemo(() => {
    if (liveCoords && isValidCoordinatePair(liveCoords.latitude, liveCoords.longitude)) {
      return { lat: liveCoords.latitude, lng: liveCoords.longitude };
    }
    return fallbackOrigin;
  }, [liveCoords, fallbackOrigin]);

  const [navState, setNavState] = useState<MapNavigationState>(
    destination ? 'ROUTE_PREVIEW' : 'NAVIGATION_FAILED',
  );
  const [routeData, setRouteData] = useState<RoadRouteData | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [userPannedDuringNav, setUserPannedDuringNav] = useState(false);
  const [isOverviewMode, setIsOverviewMode] = useState(false);
  const [isMuted, setIsMuted] = useState(voiceNavigationService.isMuted());
  const [smoothedHeading, setSmoothedHeading] = useState(0);

  const isNavigating =
    navState === 'NAVIGATION_INITIALIZING' ||
    navState === 'NAVIGATION_ACTIVE' ||
    navState === 'ROUTE_RECALCULATING';

  // Acquire location once on preview open (passive watch during preview/active screen)
  useEffect(() => {
    if (!destination) return;
    let active = true;
    startWatch('passive');
    setNavState('LOCATION_ACQUIRING');
    void refreshLocationState({ requestPermission: true, timeoutMs: 5500 }).then((fix) => {
      if (!active) return;
      if (!fix && !fallbackOrigin) {
        setNavState('LOCATION_UNAVAILABLE');
      }
    });

    return () => {
      active = false;
      stopWatch();
      voiceNavigationService.resetSession();
    };
  }, [destination, fallbackOrigin, refreshLocationState, startWatch, stopWatch]);

  // Synchronize GPS readiness without clobbering active navigation or route states
  useEffect(() => {
    if (!destination) return;
    if (isNavigating || navState === 'NAVIGATION_COMPLETED') return;

    if (
      (gpsState === 'PERMISSION_DENIED' ||
        gpsState === 'SERVICES_DISABLED' ||
        gpsState === 'UNAVAILABLE' ||
        gpsState === 'STALE') &&
      !driverOrigin
    ) {
      setNavState('LOCATION_UNAVAILABLE');
    } else if (gpsState === 'ACQUIRING' && !driverOrigin) {
      setNavState('LOCATION_ACQUIRING');
    } else if (
      driverOrigin &&
      (navState === 'ROUTE_PREVIEW' ||
        navState === 'LOCATION_ACQUIRING' ||
        navState === 'LOCATION_UNAVAILABLE')
    ) {
      setNavState('ROUTE_CALCULATING');
    }
  }, [gpsState, driverOrigin, destination, navState, isNavigating]);

  const calculateRoute = useCallback(
    async (originCoord: Coordinates, forceRefresh = false) => {
      if (!destination) return;
      setNavState((prev) =>
        prev === 'NAVIGATION_ACTIVE' || prev === 'ROUTE_RECALCULATING'
          ? 'ROUTE_RECALCULATING'
          : 'ROUTE_CALCULATING',
      );
      setRouteError(null);

      const res = await fetchRoadRouteDetails(originCoord, destination, orderId, {
        forceRefresh,
      });

      if (res.isRealRoute && res.coordinates.length >= 2) {
        setRouteData(res);
        setRouteError(null);
        setNavState((prev) =>
          prev === 'ROUTE_RECALCULATING' || prev === 'NAVIGATION_ACTIVE'
            ? 'NAVIGATION_ACTIVE'
            : prev === 'NAVIGATION_COMPLETED'
              ? 'NAVIGATION_COMPLETED'
              : 'ROUTE_READY',
        );
      } else {
        setRouteError(res.errorMessage || 'Unable to calculate road route.');
        setNavState((prev) =>
          prev === 'ROUTE_RECALCULATING' || prev === 'NAVIGATION_ACTIVE'
            ? 'NAVIGATION_ACTIVE' // Preserve active nav & previous route while offering retry
            : 'ROUTE_FAILED',
        );
      }
    },
    [destination, orderId],
  );

  useEffect(() => {
    if (!destination || !driverOrigin) return;
    if (navState === 'ROUTE_CALCULATING' && !routeData) {
      void calculateRoute(driverOrigin);
    }
  }, [destination, driverOrigin, navState, routeData, calculateRoute]);

  // Live navigation guidance, travelled/remaining split, and turn-by-turn calculation
  const guidance = useMemo(() => {
    if (!driverOrigin || !routeData?.coordinates || routeData.coordinates.length < 2) {
      return null;
    }
    return calculateNavigationGuidance({
      routeCoordinates: routeData.coordinates,
      steps: routeData.steps,
      currentPos: driverOrigin,
      totalDistanceMeters: routeData.distanceMeters,
      totalDurationMinutes: routeData.durationMinutes,
      accuracyMeters: liveCoords?.accuracy,
    });
  }, [driverOrigin, routeData, liveCoords?.accuracy]);

  // Update smoothed bearing ONLY when moving reliably (>=1.5 m/s or >=8m displacement), avoiding stationary jitter
  useEffect(() => {
    if (!driverOrigin) return;
    const speedMps = typeof liveCoords?.speed === 'number' ? liveCoords.speed : 0;
    const rawHeading = typeof liveCoords?.heading === 'number' ? liveCoords.heading : null;
    let nextHeading: number | null = null;

    if (speedMps >= 1.5 && rawHeading !== null && Number.isFinite(rawHeading) && rawHeading >= 0) {
      nextHeading = rawHeading;
    } else if (lastHeadingCoordRef.current) {
      const moved = calculateDistanceMeters(
        lastHeadingCoordRef.current.lat,
        lastHeadingCoordRef.current.lng,
        driverOrigin.lat,
        driverOrigin.lng,
      );
      if (moved >= 8) {
        nextHeading = computeBearingDegrees(lastHeadingCoordRef.current, driverOrigin);
        lastHeadingCoordRef.current = driverOrigin;
      }
    } else {
      lastHeadingCoordRef.current = driverOrigin;
      if (guidance?.routeBearingDegrees !== undefined) {
        nextHeading = guidance.routeBearingDegrees;
      }
    }

    if (nextHeading === null && isNavigating && guidance?.routeBearingDegrees !== undefined && smoothedHeadingRef.current === 0) {
      nextHeading = guidance.routeBearingDegrees;
    }

    if (nextHeading !== null) {
      const smooth = smoothBearingDegrees(smoothedHeadingRef.current, nextHeading, 0.4);
      smoothedHeadingRef.current = smooth;
      setSmoothedHeading(smooth);
    }
  }, [driverOrigin, liveCoords?.speed, liveCoords?.heading, guidance?.routeBearingDegrees, isNavigating]);

  // Voice instruction cues + noise-filtered off-route rerouting + arrival completion
  useEffect(() => {
    if (!isNavigating || !guidance || !driverOrigin) return;

    if (guidance.hasArrived) {
      offRouteCountRef.current = 0;
      voiceNavigationService.announceManeuver({
        stepIndex: guidance.currentStepIndex,
        instruction: 'You have reached your destination.',
        distanceToManeuverMeters: 0,
        isArriving: true,
      });
      setNavState('NAVIGATION_COMPLETED');
      stopWatch();
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
      const now = Date.now();
      const confirmedOffRoute =
        offRouteCountRef.current >= 2 ||
        (guidance.distanceToRouteMeters > 110 &&
          (liveCoords?.accuracy == null || liveCoords.accuracy <= 50));

      if (confirmedOffRoute && now - lastRerouteAtRef.current > 10_000) {
        lastRerouteAtRef.current = now;
        offRouteCountRef.current = 0;
        void calculateRoute(driverOrigin, true);
      }
    } else {
      offRouteCountRef.current = 0;
    }
  }, [isNavigating, guidance, driverOrigin, liveCoords?.accuracy, calculateRoute, stopWatch]);

  const handleCurrentLocationPress = () => {
    setUserPannedDuringNav(false);
    setIsOverviewMode(false);
    if (driverOrigin) {
      mapRef.current?.centerOnUser(driverOrigin);
    } else {
      setNavState('LOCATION_ACQUIRING');
      void refreshLocationState({ requestPermission: true, timeoutMs: 5000 }).then((fix) => {
        if (fix) {
          mapRef.current?.centerOnUser({ lat: fix.latitude, lng: fix.longitude });
        }
      });
    }
  };

  const handleStartNavigation = () => {
    if (!routeData?.isRealRoute || !driverOrigin || !destination) return;
    setNavState('NAVIGATION_INITIALIZING');
    setUserPannedDuringNav(false);
    setIsOverviewMode(false);
    offRouteCountRef.current = 0;
    voiceNavigationService.resetSession();
    startWatch('navigation');
    setNavState('NAVIGATION_ACTIVE');
    mapRef.current?.centerOnUser(driverOrigin);
  };

  const handleToggleOverview = () => {
    setIsOverviewMode((prev) => {
      const next = !prev;
      if (next) {
        mapRef.current?.fitRoute();
      } else if (driverOrigin) {
        setUserPannedDuringNav(false);
        mapRef.current?.centerOnUser(driverOrigin);
      }
      return next;
    });
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    voiceNavigationService.setMuted(next);
  };

  const handleExitNavigation = () => {
    setUserPannedDuringNav(false);
    setIsOverviewMode(false);
    offRouteCountRef.current = 0;
    voiceNavigationService.resetSession();
    stopWatch();
    startWatch('passive');
    setNavState(routeData?.isRealRoute ? 'ROUTE_READY' : 'NAVIGATION_CANCELLED');
    setTimeout(() => mapRef.current?.fitRoute(), 100);
  };

  const handleBack = () => {
    voiceNavigationService.resetSession();
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation?.navigate?.('MainApp');
    }
  };

  const canStartNavigation =
    Boolean(destination) &&
    Boolean(driverOrigin) &&
    Boolean(routeData?.isRealRoute) &&
    navState === 'ROUTE_READY';

  const previewDistanceLabel =
    routeData?.isRealRoute && routeData.distanceLabel ? routeData.distanceLabel : '—';
  const previewDurationLabel =
    routeData?.isRealRoute && routeData.durationMinutes
      ? formatDurationLabel(routeData.durationMinutes)
      : '—';

  const speedKmh =
    typeof liveCoords?.speed === 'number' && liveCoords.speed >= 0.4
      ? Math.round(liveCoords.speed * 3.6)
      : 0;

  const previewStatusPill = useMemo(() => {
    if (isNavigating) return null;
    if (navState === 'LOCATION_ACQUIRING') {
      return { type: 'loading' as const, text: 'Getting your location...' };
    }
    if (navState === 'ROUTE_CALCULATING') {
      return { type: 'loading' as const, text: 'Calculating road route...' };
    }
    if (gpsState === 'PERMISSION_DENIED') {
      return {
        type: 'error' as const,
        text: 'Allow location access to preview route',
        actionLabel: 'Enable',
        onAction: () => {
          void refreshLocationState({ requestPermission: true }).then((fix) => {
            if (!fix) void permissionService.openSettings();
          });
        },
      };
    }
    if (gpsState === 'SERVICES_DISABLED' || (navState === 'LOCATION_UNAVAILABLE' && !driverOrigin)) {
      return {
        type: 'error' as const,
        text: 'Turn on location services to continue',
        actionLabel: 'Retry',
        onAction: () => void refreshLocationState({ requestPermission: true }),
      };
    }
    if (navState === 'ROUTE_FAILED' && routeError) {
      return {
        type: 'error' as const,
        text: routeError,
        actionLabel: 'Retry',
        onAction: () => {
          if (driverOrigin) void calculateRoute(driverOrigin, true);
        },
      };
    }
    return null;
  }, [
    isNavigating,
    navState,
    gpsState,
    routeError,
    driverOrigin,
    refreshLocationState,
    calculateRoute,
  ]);

  if (!destination) {
    return (
      <ScreenContainer>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <KudiIcon name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <KudiIcon name="navigation" size={40} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Destination coordinates unavailable</Text>
          <Text style={styles.emptySubtitle}>
            This location does not have map coordinates configured yet.
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleBack} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* ROUTE PREVIEW HEADER (hidden during dedicated full-screen active navigation) */}
      {!isNavigating && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <KudiIcon name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            {Boolean(destinationAddress) && (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {destinationAddress}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* MAIN MAP WORKSPACE */}
      <View style={styles.mapContainer}>
        <LiveRouteMap
          ref={mapRef}
          origin={driverOrigin}
          destination={destination}
          originLabel="Your Location"
          destinationLabel={destinationLabel}
          isFullScreen={isNavigating}
          orderId={orderId}
          routeCoordinates={routeData?.coordinates}
          travelledCoordinates={guidance?.travelledCoordinates}
          remainingCoordinates={guidance?.remainingCoordinates}
          isRealRoute={Boolean(routeData?.isRealRoute)}
          isNavigationActive={isNavigating}
          isOverviewMode={isOverviewMode}
          driverHeading={smoothedHeading}
          driverSpeedMps={liveCoords?.speed}
          onUserGesture={() => {
            if (isNavigating) {
              setUserPannedDuringNav(true);
            }
          }}
        />

        {/* DEDICATED ACTIVE NAVIGATION UI (PART 3-6) */}
        {isNavigating && (
          <>
            {/* TOP TURN-BY-TURN MANEUVER BANNER */}
            <View style={styles.navInstructionWrap} pointerEvents="box-none">
              <View style={styles.navPrimaryBanner}>
                <View style={styles.navManeuverIconBox}>
                  <KudiIcon
                    name={getManeuverIconName(guidance?.currentStep?.maneuver)}
                    size={26}
                    color="#FFFFFF"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.navManeuverDist}>
                    {guidance?.distanceToManeuverLabel || 'Continue'}
                  </Text>
                  <Text style={styles.navManeuverInstruction} numberOfLines={2}>
                    {guidance?.currentStep?.instruction ||
                      `Follow route to ${destinationLabel}`}
                  </Text>
                </View>
              </View>

              {guidance?.nextStep ? (
                <View style={styles.navThenPill}>
                  <Text style={styles.navThenText}>Then</Text>
                  <KudiIcon
                    name={getManeuverIconName(guidance.nextStep.maneuver)}
                    size={15}
                    color="#FFFFFF"
                  />
                  <Text style={styles.navThenStreet} numberOfLines={1}>
                    {guidance.nextStep.streetName}
                  </Text>
                </View>
              ) : null}

              {navState === 'ROUTE_RECALCULATING' && (
                <View style={styles.reroutingBanner}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.reroutingText}>Recalculating route...</Text>
                </View>
              )}

              {routeError && navState !== 'ROUTE_RECALCULATING' && (
                <TouchableOpacity
                  style={styles.rerouteRetryBanner}
                  onPress={() => {
                    if (driverOrigin) void calculateRoute(driverOrigin, true);
                  }}
                >
                  <KudiIcon name="alert-circle" size={14} color="#92400E" />
                  <Text style={styles.rerouteRetryText}>Route sync delayed · Tap to retry</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* RIGHT-SIDE FLOATING ACTIVE NAVIGATION CONTROLS */}
            <View style={styles.navRightControls}>
              <TouchableOpacity
                style={styles.navFloatingControlBtn}
                onPress={handleToggleMute}
                accessibilityRole="button"
                accessibilityLabel={isMuted ? 'Unmute voice guidance' : 'Mute voice guidance'}
              >
                <KudiIcon name={isMuted ? 'volume-x' : 'volume-2'} size={19} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navFloatingControlBtn,
                  isOverviewMode && styles.navFloatingControlBtnActive,
                ]}
                onPress={handleToggleOverview}
                accessibilityRole="button"
                accessibilityLabel={isOverviewMode ? 'Resume driver perspective' : 'Show route overview'}
              >
                <KudiIcon name={isOverviewMode ? 'navigation' : 'map'} size={19} color="#FFFFFF" />
              </TouchableOpacity>

              {(userPannedDuringNav || isOverviewMode) && (
                <TouchableOpacity
                  style={[styles.navFloatingControlBtn, styles.navRecenterControlBtn]}
                  onPress={handleCurrentLocationPress}
                  accessibilityRole="button"
                  accessibilityLabel="Re-centre on current location"
                >
                  <KudiIcon name="crosshair" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>

            {/* BOTTOM-LEFT SPEED & STREET NAME HUD */}
            <View style={styles.navLeftHud} pointerEvents="none">
              <View style={styles.speedBadge}>
                <Text style={styles.speedNumber}>{speedKmh}</Text>
                <Text style={styles.speedUnit}>km/h</Text>
              </View>
              {Boolean(guidance?.currentStreetName) && (
                <View style={styles.streetPill}>
                  <Text style={styles.streetPillText} numberOfLines={1}>
                    {guidance?.currentStreetName}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* ROUTE PREVIEW CONTROLS & STATUS (when NOT in active navigation) */}
        {!isNavigating && (
          <>
            <TouchableOpacity
              style={styles.mapCurrentLocationBtn}
              onPress={handleCurrentLocationPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Center map on current location"
            >
              <KudiIcon name="crosshair" size={20} color={colors.primary} />
            </TouchableOpacity>

            {previewStatusPill && (
              <View
                style={[
                  styles.statusPill,
                  previewStatusPill.type === 'error' && styles.statusPillWarning,
                ]}
              >
                {previewStatusPill.type === 'loading' ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <KudiIcon name="alert-circle" size={15} color="#B45309" />
                )}
                <Text
                  style={[
                    styles.statusPillText,
                    previewStatusPill.type === 'error' && styles.statusPillWarningText,
                  ]}
                  numberOfLines={2}
                >
                  {previewStatusPill.text}
                </Text>
                {previewStatusPill.type === 'error' && previewStatusPill.actionLabel && (
                  <TouchableOpacity
                    onPress={previewStatusPill.onAction}
                    style={styles.pillActionBtn}
                  >
                    <Text style={styles.pillActionText}>{previewStatusPill.actionLabel}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </View>

      {/* BOTTOM PANEL: EITHER DARK ACTIVE NAVIGATION BAR OR CLEAN ROUTE PREVIEW SHEET */}
      {isNavigating ? (
        <View style={styles.navBottomPanel}>
          <TouchableOpacity
            style={styles.navExitBtn}
            onPress={handleExitNavigation}
            accessibilityRole="button"
            accessibilityLabel="Exit navigation"
          >
            <KudiIcon name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.navEtaCenter}>
            <Text style={styles.navEtaPrimary} numberOfLines={1}>
              {guidance?.formattedRemainingDuration || previewDurationLabel}
            </Text>
            <Text style={styles.navEtaSecondary} numberOfLines={1}>
              {guidance
                ? `${guidance.remainingDistanceLabel} · ${guidance.etaClockTime}`
                : previewDistanceLabel}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navOverviewPillBtn}
            onPress={handleToggleOverview}
            accessibilityRole="button"
            accessibilityLabel="Toggle route overview"
          >
            <KudiIcon name="git-fork" size={18} color="#93C5FD" />
          </TouchableOpacity>
        </View>
      ) : navState === 'NAVIGATION_COMPLETED' ? (
        <View style={styles.bottomCard}>
          <View style={styles.destRow}>
            <View style={[styles.destIconCircle, { backgroundColor: '#EAF5EF' }]}>
              <KudiIcon name="check-circle" size={20} color="#16805A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.destTitle} numberOfLines={1}>
                Arrived at {destinationLabel}
              </Text>
              {Boolean(destinationAddress) && (
                <Text style={styles.destAddress} numberOfLines={2}>
                  {destinationAddress}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={[styles.startNavButton, { backgroundColor: '#16805A' }]}
            onPress={handleBack}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Done"
          >
            <KudiIcon name="check-circle" size={18} color="#FFFFFF" />
            <Text style={styles.startNavButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bottomCard}>
          <View style={styles.destRow}>
            <View style={styles.destIconCircle}>
              <KudiIcon name="navigation" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.destTitle} numberOfLines={1}>
                {destinationLabel}
              </Text>
              {Boolean(destinationAddress) && (
                <Text style={styles.destAddress} numberOfLines={2}>
                  {destinationAddress}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Distance</Text>
              <Text style={styles.metricValue}>{previewDistanceLabel}</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Est. Time</Text>
              <Text style={styles.metricValue}>{previewDurationLabel}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.startNavButton,
              !canStartNavigation && styles.startNavButtonDisabled,
            ]}
            onPress={handleStartNavigation}
            disabled={!canStartNavigation}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Start Navigation"
          >
            <KudiIcon name="navigation" size={18} color="#FFFFFF" />
            <Text style={styles.startNavButtonText}>
              {navState === 'ROUTE_CALCULATING'
                ? 'Calculating Route...'
                : navState === 'LOCATION_ACQUIRING'
                  ? 'Getting Location...'
                  : 'Start Navigation'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E2DED7',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapCurrentLocationBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 5,
  },
  statusPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 68,
    zIndex: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DED7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  statusPillWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusPillText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  statusPillWarningText: {
    color: '#92400E',
  },
  pillActionBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pillActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderColor: '#E2DED7',
    gap: 12,
  },
  destRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  destIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171716',
  },
  destAddress: {
    fontSize: 12.5,
    color: '#65635F',
    marginTop: 2,
    lineHeight: 17,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricPill: {
    flex: 1,
    backgroundColor: '#F8F7F4',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EAE6DE',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#65635F',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171716',
  },
  startNavButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startNavButtonDisabled: {
    opacity: 0.45,
  },
  startNavButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  // Active Navigation Mode HUD
  navInstructionWrap: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 25,
    alignItems: 'flex-start',
  },
  navPrimaryBanner: {
    width: '100%',
    backgroundColor: '#0D5C43',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  navManeuverIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navManeuverDist: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A7F3D0',
    marginBottom: 2,
  },
  navManeuverInstruction: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 21,
  },
  navThenPill: {
    marginTop: 6,
    backgroundColor: '#094230',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '85%',
    elevation: 5,
  },
  navThenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D1FAE5',
  },
  navThenStreet: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  reroutingBanner: {
    marginTop: 8,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reroutingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rerouteRetryBanner: {
    marginTop: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rerouteRetryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  navRightControls: {
    position: 'absolute',
    right: 12,
    bottom: 92,
    zIndex: 25,
    gap: 10,
  },
  navFloatingControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(17, 19, 21, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  navFloatingControlBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#60A5FA',
  },
  navRecenterControlBtn: {
    backgroundColor: '#2563EB',
    borderColor: '#93C5FD',
  },
  navLeftHud: {
    position: 'absolute',
    left: 12,
    right: 70,
    bottom: 14,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  speedBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(17, 19, 21, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  speedUnit: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  streetPill: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: '72%',
  },
  streetPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navBottomPanel: {
    backgroundColor: '#111315',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#272A2E',
    gap: 12,
  },
  navExitBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F2429',
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navEtaCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navEtaPrimary: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4ADE80',
    letterSpacing: -0.3,
  },
  navEtaSecondary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D1D5DB',
    marginTop: 2,
  },
  navOverviewPillBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F2429',
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#171716',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#65635F',
    textAlign: 'center',
    lineHeight: 19,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
