import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  LayoutAnimation,
} from 'react-native';
import { useDriverStore } from '../../store/useDriverStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useLocationStore } from '../../store/useLocationStore';
import { KudiIcon } from '../../components/KudiIcon';
import { SurgeBanner, SurgeDetailsSheet } from '../../components/SurgeBanner';
import { dashboardStyles as styles } from './dashboard/dashboard.styles';
import { DashboardEarningsCard } from './dashboard/DashboardEarningsCard';
import { DashboardOperationalStatus, OfflineNotice } from './dashboard/DashboardOperationalStatus';
import { DashboardBonusCard } from './dashboard/DashboardBonusCard';
import { DashboardOpportunitiesSection } from './dashboard/DashboardOpportunitiesSection';
import { DashboardAssignmentOverlay } from './dashboard/DashboardAssignmentOverlay';
import { permissionService } from '../../services/permissionService';
import { evaluateHubProximity, isValidCoordinatePair } from '../../utils/geospatial';
import { getFriendlyErrorMessage } from '../../utils/errorHandling';

export const DashboardScreen = ({ navigation }: any) => {
  const {
    profile,
    isOnline = false,
    assignedHub,
    workSummary,
    fetchProfileAsync,
    fetchDashboardAsync,
  } = useDriverStore();
  const { activeOrders, fetchAssignedOrdersAsync } = useOrderStore();
  const fetchNotificationsAsync = useNotificationStore((s) => s.fetchNotificationsAsync);
  const unreadNotifications = useNotificationStore(
    (s) => s.notifications.filter((n) => !n.read).length
  );

  const [showSurgeDetails, setShowSurgeDetails] = useState(false);
  const [dutyNotice, setDutyNotice] = useState<OfflineNotice | null>(null);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const {
    gpsState,
    checkPermissionOnly,
    refreshLocationState,
  } = useLocationStore();

  // Authoritative data fetch on screen mount
  useEffect(() => {
    fetchProfileAsync?.();
    fetchDashboardAsync?.();
    fetchAssignedOrdersAsync();
    fetchNotificationsAsync?.();
  }, [fetchProfileAsync, fetchDashboardAsync, fetchAssignedOrdersAsync, fetchNotificationsAsync]);

  // Lightweight permission check while offline without continuous GPS polling
  useEffect(() => {
    if (isOnline) {
      fetchAssignedOrdersAsync();
      fetchDashboardAsync?.();
      return;
    }
    void checkPermissionOnly();
  }, [isOnline, fetchAssignedOrdersAsync, fetchDashboardAsync, checkPermissionOnly]);

  // Clear previous GPS duty failure the instant GPS state recovers
  useEffect(() => {
    if (gpsState === 'READY') {
      setDutyNotice((prev) => (prev && prev.tone !== 'info' ? null : prev));
    }
  }, [gpsState]);

  const activeOrder = activeOrders.length > 0 ? activeOrders[0] : null;
  const isPrePickupStatus =
    !!activeOrder &&
    (activeOrder.status === 'ASSIGNED' ||
      activeOrder.status === 'ACCEPTED' ||
      activeOrder.status === 'PACKING' ||
      activeOrder.status === 'PREPARING' ||
      activeOrder.status === 'READY_FOR_PICKUP');
  const hasActiveDelivery =
    isOnline &&
    !!activeOrder &&
    (activeOrder.status === 'OUT_FOR_DELIVERY' ||
      activeOrder.status === 'TRY_AND_BUY' ||
      activeOrder.status === 'RETURNING' ||
      activeOrder.status === 'PICKED_UP' ||
      (isPrePickupStatus && Boolean(activeOrder.accepted)));

  const handleToggleOnline = async (value: boolean) => {
    if (isUpdatingAvailability) return;
    setIsUpdatingAvailability(true);
    setDutyNotice(null);
    let coords: { latitude: number; longitude: number; accuracy?: number } | undefined;

    try {
      if (value) {
        setDutyNotice({
          tone: 'info',
          message: 'Getting your location...',
        });

        const gps = await refreshLocationState({ requestPermission: true, timeoutMs: 5500 });
        const latestGpsState = useLocationStore.getState().gpsState;

        if (!gps) {
          if (latestGpsState === 'PERMISSION_DENIED') {
            setDutyNotice({
              tone: 'warning',
              message: 'Allow location access to go online.',
              actionLabel: 'Enable Location',
              onAction: () => {
                void refreshLocationState({ requestPermission: true }).then((fix) => {
                  if (!fix) void permissionService.openSettings();
                });
              },
            });
          } else if (latestGpsState === 'SERVICES_DISABLED') {
            setDutyNotice({
              tone: 'warning',
              message: 'Turn on location services to continue.',
              actionLabel: 'Retry',
              onAction: () => void handleToggleOnline(true),
            });
          } else {
            setDutyNotice({
              tone: 'warning',
              message: 'Turn on location services to continue.',
              actionLabel: 'Retry',
              onAction: () => void handleToggleOnline(true),
            });
          }
          return;
        }

        let hub = useDriverStore.getState().assignedHub;
        if (!hub) {
          await fetchProfileAsync?.();
          hub = useDriverStore.getState().assignedHub;
        }

        const proximity = evaluateHubProximity({
          driverLat: gps.latitude,
          driverLng: gps.longitude,
          hubLat: hub?.lat,
          hubLng: hub?.lng,
          accuracyMeters: gps.accuracy,
        });

        if (!proximity.allowed) {
          if (proximity.issue === 'POOR_ACCURACY') {
            setDutyNotice({
              tone: 'warning',
              message: 'GPS signal is weak. Try again in an open area.',
              actionLabel: 'Retry',
              onAction: () => void handleToggleOnline(true),
            });
          } else if (proximity.issue === 'OUTSIDE_HUB') {
            setDutyNotice({
              tone: 'warning',
              message: 'Move closer to your assigned hub to go online.',
              actionLabel:
                hub && isValidCoordinatePair(hub.lat, hub.lng) ? 'View Hub' : undefined,
              onAction:
                hub && isValidCoordinatePair(hub.lat, hub.lng)
                  ? () =>
                      navigation?.navigate?.('InAppMap', {
                        title: hub!.name,
                        destinationLabel: hub!.name,
                        destinationAddress: hub!.address,
                        destination: { lat: hub!.lat!, lng: hub!.lng! },
                      })
                  : undefined,
            });
          } else {
            setDutyNotice({
              tone: 'warning',
              message:
                proximity.issue === 'HUB_UNAVAILABLE'
                  ? 'Assigned hub location missing.'
                  : 'Turn on location services to continue.',
              actionLabel: 'Retry',
              onAction: () => void handleToggleOnline(true),
            });
          }
          return;
        }

        coords = {
          latitude: gps.latitude,
          longitude: gps.longitude,
          ...(typeof gps.accuracy === 'number' ? { accuracy: gps.accuracy } : {}),
        };
      }

      await useDriverStore.getState().setIsOnlineAsync(value, coords);
      setDutyNotice(null);
      try {
        (LayoutAnimation as any)?.configureNext?.(
          (LayoutAnimation as any)?.Presets?.easeInEaseOut,
        );
      } catch (_) {}

      if (!value) {
        const hasTransitOrder = useOrderStore
          .getState()
          .activeOrders.some(
            (o) => o.status === 'PICKED_UP' || o.status === 'OUT_FOR_DELIVERY',
          );
        if (!hasTransitOrder) {
          permissionService.stopNativeTracking().catch(() => {});
        }
      } else {
        fetchAssignedOrdersAsync();
      }
    } catch (err: any) {
      const rawMsg = String(err?.message || '').toLowerCase();
      if (rawMsg.includes('kyc')) {
        setDutyNotice({
          tone: 'error',
          message: getFriendlyErrorMessage(err, 'Complete KYC approval to go online.'),
        });
      } else if (rawMsg.includes('accuracy') || rawMsg.includes('weak')) {
        setDutyNotice({
          tone: 'warning',
          message: 'GPS signal is weak. Try again in an open area.',
          actionLabel: 'Retry',
          onAction: () => void handleToggleOnline(true),
        });
      } else if (rawMsg.includes('away') || rawMsg.includes('within')) {
        const hub = useDriverStore.getState().assignedHub;
        setDutyNotice({
          tone: 'warning',
          message: 'Move closer to your assigned hub to go online.',
          actionLabel:
            hub && isValidCoordinatePair(hub.lat, hub.lng) ? 'View Hub' : 'Retry',
          onAction:
            hub && isValidCoordinatePair(hub.lat, hub.lng)
              ? () =>
                  navigation?.navigate?.('InAppMap', {
                    title: hub.name,
                    destinationLabel: hub.name,
                    destinationAddress: hub.address,
                    destination: { lat: hub.lat!, lng: hub.lng! },
                  })
              : () => void handleToggleOnline(true),
        });
      } else {
        setDutyNotice({
          tone: 'error',
          message: "Couldn't update availability. Please retry.",
          actionLabel: 'Retry',
          onAction: () => void handleToggleOnline(true),
        });
      }
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const offlineNotice = useMemo<OfflineNotice | null>(() => {
    if (isOnline) return null;
    if (dutyNotice) return dutyNotice;
    if (gpsState === 'PERMISSION_DENIED') {
      return {
        tone: 'warning',
        message: 'Allow location access to go online.',
        actionLabel: 'Enable Location',
        onAction: () => {
          void refreshLocationState({ requestPermission: true }).then((fix) => {
            if (!fix) void permissionService.openSettings();
          });
        },
      };
    }
    return null;
  }, [isOnline, dutyNotice, gpsState, refreshLocationState]);

  const getInitials = () => {
    if (profile.avatarInitial) return profile.avatarInitial;
    return profile.fullName ? profile.fullName.substring(0, 2).toUpperCase() : 'DP';
  };

  const isFullTimeProfile = profile.workPreference === 'FULL_TIME';
  const roleLabel = isFullTimeProfile ? 'Full-time' : 'Part-time';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </TouchableOpacity>
            <View style={styles.profileTextContainer}>
              <Text style={styles.headerName} numberOfLines={1}>
                {profile.name?.split(' ')[0] || (profile.fullName ? profile.fullName.split(' ')[0] : 'Partner')}
              </Text>
              <Text style={styles.headerRole} numberOfLines={1}>
                {roleLabel} · ID: {profile.id || 'Pending'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isUpdatingAvailability}
              onPress={() => void handleToggleOnline(!isOnline)}
              accessibilityRole="switch"
              accessibilityState={{ checked: isOnline, disabled: isUpdatingAvailability }}
              style={[
                styles.customToggleTrack,
                {
                  backgroundColor: isOnline ? '#16805A' : '#D3CEC7',
                  borderColor: isOnline ? '#16805A' : '#D3CEC7',
                  opacity: isUpdatingAvailability ? 0.65 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.customToggleThumb,
                  { transform: [{ translateX: isOnline ? 20 : 0 }] },
                ]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => navigation?.navigate('Notifications')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Notifications, ${unreadNotifications} unread`}
            >
              <KudiIcon name="notifications" size={19} color="#171716" />
              {unreadNotifications > 0 && <View style={styles.bellBadgeDot} />}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Module 1: Earnings Card */}
          <DashboardEarningsCard workSummary={workSummary} isOnline={isOnline} />

          {/* Surge Incentives Banner */}
          <SurgeBanner onPressDetails={() => setShowSurgeDetails(true)} />

          {/* Module 2: Operational Status Card / Active Delivery Card */}
          <DashboardOperationalStatus
            isOnline={isOnline}
            activeOrder={activeOrder}
            hasActiveDelivery={hasActiveDelivery}
            navigation={navigation}
            offlineNotice={offlineNotice}
          />

          {/* Module 3: Swipeable Bonus Card */}
          <DashboardBonusCard navigation={navigation} />

          {/* Module 4: Opportunities Section */}
          <DashboardOpportunitiesSection navigation={navigation} />
        </ScrollView>

        {/* Fullscreen Order Assignment Overlay */}
        {isOnline && activeOrder && !activeOrder.accepted && isPrePickupStatus && (
          <DashboardAssignmentOverlay activeOrder={activeOrder} navigation={navigation} />
        )}

        {/* Surge & Incentives Detail Bottom Sheet */}
        <SurgeDetailsSheet
          visible={showSurgeDetails}
          onClose={() => setShowSurgeDetails(false)}
        />
      </View>
    </SafeAreaView>
  );
};
