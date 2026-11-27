import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { KudiIcon } from '../../../components/KudiIcon';
import { DeliveryScooterIcon } from '../../../components/DeliveryScooterIcon';
import { LiveRouteMap } from '../LiveRouteMap';
import { RadarPulse } from './RadarPulse';
import { dashboardStyles as styles } from './dashboard.styles';

export interface OfflineNotice {
  tone: 'warning' | 'error' | 'info';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ActiveOrderProps {
  id: string;
  status: string;
  pickupLocation: string;
  customerAddress: string;
  pickupCoordinates?: { latitude: number; longitude: number } | null;
  deliveryCoordinates?: { latitude: number; longitude: number } | null;
  isTryAndBuy?: boolean;
  isArrived?: boolean;
  arrivedAt?: string | null;
  tryAndBuyStage?: string;
}

interface DashboardOperationalStatusProps {
  isOnline: boolean;
  activeOrder: ActiveOrderProps | null;
  hasActiveDelivery: boolean;
  navigation: any;
  offlineNotice?: OfflineNotice | null;
}

export const DashboardOperationalStatus: React.FC<DashboardOperationalStatusProps> = ({
  isOnline,
  activeOrder,
  hasActiveDelivery,
  navigation,
  offlineNotice,
}) => {
  const previewOrigin = useMemo(
    () =>
      activeOrder?.pickupCoordinates
        ? {
            lat: activeOrder.pickupCoordinates.latitude,
            lng: activeOrder.pickupCoordinates.longitude,
          }
        : null,
    [activeOrder?.pickupCoordinates?.latitude, activeOrder?.pickupCoordinates?.longitude],
  );

  const previewDestination = useMemo(
    () =>
      activeOrder?.deliveryCoordinates
        ? {
            lat: activeOrder.deliveryCoordinates.latitude,
            lng: activeOrder.deliveryCoordinates.longitude,
          }
        : null,
    [activeOrder?.deliveryCoordinates?.latitude, activeOrder?.deliveryCoordinates?.longitude],
  );

  if (!isOnline) {
    const isErrorTone = offlineNotice?.tone === 'error';
    const isInfoTone = offlineNotice?.tone === 'info';
    const noticeBg = isInfoTone ? '#F3F1EC' : isErrorTone ? '#FEF2F2' : '#FFFBEB';
    const noticeBorder = isInfoTone ? '#E2DED7' : isErrorTone ? '#FECACA' : '#FDE68A';
    const noticeColor = isInfoTone ? '#4A4945' : isErrorTone ? '#991B1B' : '#92400E';

    return (
      <View style={[styles.card, styles.centerCard]}>
        <View style={styles.statusInner}>
          <View style={styles.statusIconBgOffline}>
            <DeliveryScooterIcon size={24} color="#333333" />
          </View>
          <Text style={styles.statusHeadline}>You're offline</Text>
          <Text style={styles.statusSub}>Go online to start receiving orders.</Text>

          {offlineNotice ? (
            <View
              accessibilityRole={isInfoTone ? 'text' : 'alert'}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                backgroundColor: noticeBg,
                borderWidth: 1,
                borderColor: noticeBorder,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 7,
                marginTop: 10,
                maxWidth: '94%',
              }}
            >
              <KudiIcon
                name={isInfoTone ? 'clock' : 'alert-circle'}
                size={14}
                color={noticeColor}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: noticeColor,
                  flexShrink: 1,
                }}
                numberOfLines={2}
              >
                {offlineNotice.message}
              </Text>
              {offlineNotice.actionLabel && offlineNotice.onAction ? (
                <TouchableOpacity
                  onPress={offlineNotice.onAction}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: noticeColor,
                      textDecorationLine: 'underline',
                    }}
                  >
                    {offlineNotice.actionLabel}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          <View style={styles.storeDetailsSection}>
            <TouchableOpacity
              style={[styles.storeDetailsBtn, { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20 }]}
              onPress={() => navigation?.navigate('StoreDetails')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Store Details"
            >
              <KudiIcon name="navigation" size={16} color="#65635F" />
              <Text style={styles.storeDetailsBtnText} numberOfLines={1}>Store Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (hasActiveDelivery && activeOrder) {
    return (
      <View style={[styles.card, styles.activeDeliveryCard]}>
        {/* Header row: Status chip + Order ID */}
        <View style={styles.activeDeliveryHeader}>
          <View style={styles.activeDeliveryStatusPill}>
            <View style={styles.activeDeliveryPulseDot} />
            <Text style={styles.activeDeliveryStatusText}>
              {activeOrder.status === 'RETURNING'
                ? activeOrder.tryAndBuyStage === 'STORE_RECONCILIATION'
                  ? 'Waiting for store confirmation'
                  : 'Returning to store'
                : activeOrder.status === 'TRY_AND_BUY' ||
                    ((activeOrder.isArrived || activeOrder.arrivedAt) && activeOrder.isTryAndBuy)
                  ? activeOrder.tryAndBuyStage === 'TRIAL_IN_PROGRESS'
                    ? 'Trial in progress'
                    : 'Try & Buy at doorstep'
                  : activeOrder.isArrived || activeOrder.arrivedAt
                    ? 'At customer'
                    : activeOrder.status === 'ACCEPTED' ||
                        activeOrder.status === 'PACKING' ||
                        activeOrder.status === 'PREPARING'
                      ? 'Waiting for packing'
                      : activeOrder.status === 'READY_FOR_PICKUP' ||
                          activeOrder.status === 'ASSIGNED'
                        ? 'Ready for pickup'
                        : activeOrder.status === 'PICKED_UP'
                          ? 'Picked up • Start delivery'
                          : 'On the way'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {activeOrder.isTryAndBuy && (
              <View
                style={{
                  backgroundColor: '#FFF0E8',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: '#FFD9C7',
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#FF5A1F' }}>TRY & BUY</Text>
              </View>
            )}
            <Text style={styles.activeDeliveryOrderId}>{activeOrder.id}</Text>
          </View>
        </View>

        {/* Map Preview Container */}
        <View style={styles.activeDeliveryMapWrap} pointerEvents="none">
          <LiveRouteMap
            origin={previewOrigin}
            destination={previewDestination}
            originLabel={activeOrder.pickupLocation}
            destinationLabel={activeOrder.customerAddress}
            isPreview={true}
            orderId={activeOrder.id}
          />
        </View>

        {/* Compact Action at the bottom */}
        <TouchableOpacity
          style={styles.continueActionBtn}
          activeOpacity={0.92}
          onPress={() => navigation.navigate('OrderDetails', { orderId: activeOrder.id })}
          accessibilityRole="button"
          accessibilityLabel={activeOrder.status === 'RETURNING' ? 'Navigate to store' : 'Continue delivery'}
        >
          <Text style={styles.continueActionText}>
            {activeOrder.status === 'RETURNING'
              ? activeOrder.tryAndBuyStage === 'STORE_RECONCILIATION'
                ? 'Reconcile return'
                : 'Navigate to store'
              : activeOrder.status === 'TRY_AND_BUY' ||
                  ((activeOrder.isArrived || activeOrder.arrivedAt) && activeOrder.isTryAndBuy)
                ? activeOrder.tryAndBuyStage === 'TRIAL_IN_PROGRESS'
                  ? 'View trial in progress'
                  : 'Manage Try & Buy'
                : activeOrder.status === 'ACCEPTED' ||
                    activeOrder.status === 'PACKING' ||
                    activeOrder.status === 'PREPARING'
                  ? 'View pickup details'
                  : activeOrder.status === 'READY_FOR_PICKUP' ||
                      activeOrder.status === 'ASSIGNED'
                    ? 'Proceed to pickup'
                    : activeOrder.status === 'PICKED_UP'
                      ? 'Start delivery'
                      : 'Continue delivery'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.centerCard]}>
      <View style={styles.statusInner}>
        <RadarPulse>
          <View style={styles.statusIconBg}>
            <DeliveryScooterIcon size={24} color="#333333" />
          </View>
        </RadarPulse>
        <Text style={[styles.statusHeadline, { marginBottom: 8 }]}>Looking for orders</Text>
        <Text style={styles.statusSub}>Stay near your hub. We'll let you know when an order comes in.</Text>
      </View>
    </View>
  );
};
