import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { KudiIcon } from '../../../components/KudiIcon';
import { DeliveryScooterIcon } from '../../../components/DeliveryScooterIcon';
import { LiveRouteMap, DEFAULT_HUB_COORDINATES, DEFAULT_DEST_COORDINATES } from '../LiveRouteMap';
import { RadarPulse } from './RadarPulse';
import { dashboardStyles as styles } from './dashboard.styles';

interface ActiveOrderProps {
  id: string;
  status: string;
  pickupLocation: string;
  customerAddress: string;
  isTryAndBuy?: boolean;
  tryAndBuyStage?: string;
}

interface DashboardOperationalStatusProps {
  isOnline: boolean;
  activeOrder: ActiveOrderProps | null;
  hasActiveDelivery: boolean;
  navigation: any;
}

export const DashboardOperationalStatus: React.FC<DashboardOperationalStatusProps> = ({
  isOnline,
  activeOrder,
  hasActiveDelivery,
  navigation,
}) => {
  if (!isOnline) {
    return (
      <View style={[styles.card, styles.centerCard]}>
        <View style={styles.statusInner}>
          <View style={styles.statusIconBgOffline}>
            <DeliveryScooterIcon size={24} color="#333333" />
          </View>
          <Text style={styles.statusHeadline}>You're offline</Text>
          <Text style={styles.statusSub}>Go online to start receiving orders.</Text>

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
                ? activeOrder.tryAndBuyStage === 'WAITING_STORE_CONFIRMATION'
                  ? 'Waiting for confirmation'
                  : activeOrder.tryAndBuyStage === 'STORE_RECONCILIATION'
                  ? 'At store'
                  : 'Returning to store'
                : activeOrder.status === 'ARRIVED' && activeOrder.isTryAndBuy && activeOrder.tryAndBuyStage === 'TRIAL_IN_PROGRESS'
                ? 'Trial in progress'
                : activeOrder.status === 'ARRIVED'
                ? 'At customer'
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
            origin={DEFAULT_HUB_COORDINATES}
            destination={DEFAULT_DEST_COORDINATES}
            originLabel={activeOrder.pickupLocation}
            destinationLabel={activeOrder.customerAddress}
            isPreview={true}
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
              ? activeOrder.tryAndBuyStage === 'WAITING_STORE_CONFIRMATION'
                ? 'View confirmation status'
                : activeOrder.tryAndBuyStage === 'STORE_RECONCILIATION'
                ? 'Reconcile return'
                : 'Navigate to store'
              : activeOrder.status === 'ARRIVED' && activeOrder.isTryAndBuy && activeOrder.tryAndBuyStage === 'TRIAL_IN_PROGRESS'
              ? 'View trial in progress'
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
