import React, { useEffect, useState } from 'react';
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
import { toast } from '../../store/useToastStore';
import { KudiIcon } from '../../components/KudiIcon';
import { SurgeBanner, SurgeDetailsSheet } from '../../components/SurgeBanner';
import { dashboardStyles as styles } from './dashboard/dashboard.styles';
import { DashboardEarningsCard } from './dashboard/DashboardEarningsCard';
import { DashboardOperationalStatus } from './dashboard/DashboardOperationalStatus';
import { DashboardBonusCard } from './dashboard/DashboardBonusCard';
import { DashboardOpportunitiesSection } from './dashboard/DashboardOpportunitiesSection';
import { DashboardAssignmentOverlay } from './dashboard/DashboardAssignmentOverlay';
import { permissionService } from '../../services/permissionService';

export const DashboardScreen = ({ navigation }: any) => {
  const {
    profile,
    isOnline = false,
    setIsOnline,
    workSummary,
    fetchProfileAsync,
    fetchDashboardAsync,
  } = useDriverStore();
  const { activeOrders, fetchAssignedOrdersAsync, clearOrders } = useOrderStore();
  const fetchNotificationsAsync = useNotificationStore((s) => s.fetchNotificationsAsync);
  const unreadNotifications = useNotificationStore(
    (s) => s.notifications.filter((n) => !n.read).length
  );

  const [showSurgeDetails, setShowSurgeDetails] = useState(false);

  // Authoritative data fetch on screen mount
  useEffect(() => {
    fetchProfileAsync?.();
    fetchDashboardAsync?.();
    fetchAssignedOrdersAsync();
    fetchNotificationsAsync?.();
  }, [fetchProfileAsync, fetchDashboardAsync, fetchAssignedOrdersAsync, fetchNotificationsAsync]);

  // Periodic/online sync of active assignments
  useEffect(() => {
    if (isOnline) {
      fetchAssignedOrdersAsync();
      fetchDashboardAsync?.();
    }
  }, [isOnline, fetchAssignedOrdersAsync, fetchDashboardAsync]);

  const activeOrder = activeOrders.length > 0 ? activeOrders[0] : null;
  const hasActiveDelivery =
    isOnline &&
    !!activeOrder &&
    (activeOrder.status === 'OUT_FOR_DELIVERY' ||
      activeOrder.status === 'ARRIVED' ||
      activeOrder.status === 'RETURNING' ||
      activeOrder.status === 'PICKED_UP');

  const handleToggleOnline = async (value: boolean) => {
    if (value) {
      const locStatus = await permissionService.check('location');
      if (locStatus !== 'granted') {
        const req = await permissionService.request('location');
        if (req !== 'granted') {
          toast.show({
            type: 'error',
            message: 'Location access is required to receive nearby delivery dispatches.',
          });
          return;
        }
      }
    }

    try {
      await useDriverStore.getState().setIsOnlineAsync(value);
      try {
        (LayoutAnimation as any)?.configureNext?.(
          (LayoutAnimation as any)?.Presets?.easeInEaseOut
        );
      } catch (_) {}

      if (!value) {
        clearOrders();
        permissionService.stopNativeTracking().catch(() => {});
        toast.info('You are now offline.');
      } else {
        fetchAssignedOrdersAsync();
        toast.success('You are online. Ready for assignments.');
      }
    } catch (err: any) {
      toast.error(
        err?.message || 'Driver account cannot go Online until KYC verification is APPROVED.',
      );
    }
  };

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
              onPress={() => handleToggleOnline(!isOnline)}
              style={[
                styles.customToggleTrack,
                {
                  backgroundColor: isOnline ? '#16805A' : '#D3CEC7',
                  borderColor: isOnline ? '#16805A' : '#D3CEC7',
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
          <DashboardEarningsCard workSummary={workSummary} />

          {/* Surge Incentives Banner */}
          <SurgeBanner onPressDetails={() => setShowSurgeDetails(true)} />

          {/* Module 2: Operational Status Card / Active Delivery Card */}
          <DashboardOperationalStatus
            isOnline={isOnline}
            activeOrder={activeOrder}
            hasActiveDelivery={hasActiveDelivery}
            navigation={navigation}
          />

          {/* Module 3: Swipeable Bonus Card */}
          <DashboardBonusCard />

          {/* Module 4: Opportunities Section */}
          <DashboardOpportunitiesSection />
        </ScrollView>

        {/* Fullscreen Order Assignment Overlay */}
        {isOnline && activeOrder && (!activeOrder.accepted && activeOrder.status === 'ASSIGNED') && (
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
