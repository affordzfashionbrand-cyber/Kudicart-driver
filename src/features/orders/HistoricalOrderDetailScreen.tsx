import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../theme/colors';
import { useOrderStore, Order } from '../../store/useOrderStore';
import { useDriverStore } from '../../store/useDriverStore';
import { KudiIcon } from '../../components/KudiIcon';
import { toast } from '../../store/useToastStore';
import { styles } from './historicalOrderDetail.styles';

export const HistoricalOrderDetailScreen = ({ route, navigation }: any) => {
  const { orderId } = route?.params || {};
  const { historicalOrders } = useOrderStore();
  const { assignedStore } = useDriverStore();

  // Find targeted historical order, fallback to first historical order if not found
  const order: Order =
    historicalOrders.find((o) => o.id === orderId) ||
    historicalOrders[0] || {
      id: orderId || '#KC10247',
      orderType: 'STANDARD',
      isTryAndBuy: false,
      status: 'DELIVERED',
      pickupLocation: 'KudiCart Darkstore Hub #04 - Indiranagar',
      itemsCount: 3,
      toteId: '#T-08',
      customerName: 'Rahul V.',
      customerAddress: 'Flat 402, Golden Estate, Koramangala 4th Block, Bengaluru',
      customerPhone: '+91 98765 12345',
      distance: '2.4 km',
      date: 'Today, 09:15 AM',
      earnings: 55,
    };

  const orderKm = order.distance || '2.4 km';
  const orderEarnings = order.earnings || 55;
  const storeName =
    order.pickupLocation ||
    assignedStore?.name ||
    'KudiCart Darkstore Hub #04 - Indiranagar';
  const storeAddress =
    assignedStore?.address ||
    'HSR Sector 2, 12th Main Road, Bengaluru — 560102';
  const customerName = order.customerName || 'Customer';
  const customerAddress =
    order.customerAddress || 'Customer Address, Bengaluru';

  // Compute breakdown approximations based on distance & earnings
  const basePay = 35;
  const distancePay = Math.max(0, orderEarnings - basePay - 5);
  const incentivePay = orderEarnings - basePay - distancePay;

  const handleBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate?.('MainApp');
    }
  };

  return (
    <ScreenContainer>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <KudiIcon name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerIdBadge}>
          <Text style={styles.headerIdText}>{order.id}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Status & Timestamp Banner */}
        <View style={styles.statusBannerCard}>
          <View style={styles.statusBannerLeft}>
            <View style={styles.statusIconWrap}>
              <KudiIcon name="check-circle" size={24} color="#16805A" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.statusRow}>
                <Text style={styles.statusTitle}>Completed & Delivered</Text>
                <View style={styles.deliveredPill}>
                  <Text style={styles.deliveredPillText}>DELIVERED</Text>
                </View>
              </View>
              <Text style={styles.statusSubtitle}>{order.date || 'Delivered'}</Text>
            </View>
          </View>
        </View>

        {/* 2. Pickup & Delivery Trajectory Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Route Trajectory</Text>

          <View style={styles.routeContainer}>
            {/* Pickup Node */}
            <View style={styles.routePointRow}>
              <View style={styles.routeIconStore}>
                <KudiIcon name="home" size={16} color="#16805A" />
              </View>
              <View style={styles.routeContent}>
                <Text style={styles.routeLabelStore}>Store Picked Up</Text>
                <Text style={styles.routeStoreName}>{storeName}</Text>
                <Text style={styles.routeStoreAddress}>{storeAddress}</Text>
              </View>
            </View>

            {/* Connecting Line & Distance Metric */}
            <View style={styles.routeConnectorRow}>
              <View style={styles.routeConnectorLine} />
              <View style={styles.distanceBadge}>
                <KudiIcon name="navigation" size={12} color={colors.primary} />
                <Text style={styles.distanceBadgeText}>{orderKm} Total Ride</Text>
              </View>
            </View>

            {/* Drop Node */}
            <View style={styles.routePointRow}>
              <View style={styles.routeIconDest}>
                <KudiIcon name="package" size={16} color={colors.primary} />
              </View>
              <View style={styles.routeContent}>
                <Text style={styles.routeLabelDest}>Customer Delivery</Text>
                <Text style={styles.routeCustomerName}>{customerName}</Text>
                <Text style={styles.routeCustomerAddress}>{customerAddress}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Earnings & Payout Breakdown Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Earnings & Payout</Text>

          {/* Hero Earnings Row */}
          <View style={styles.earningsHeroRow}>
            <View>
              <Text style={styles.earningsHeroLabel}>Total Trip Earnings</Text>
              <Text style={styles.earningsHeroDistance}>Completed trip payout</Text>
            </View>
            <Text style={styles.earningsHeroValue}>₹{orderEarnings}</Text>
          </View>

          {/* Transparent Itemized Payout Box */}
          <View style={styles.payoutBreakdownBox}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Base order payout</Text>
              <Text style={styles.breakdownValue}>₹{basePay}</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Distance & fuel component</Text>
              <Text style={styles.breakdownValue}>₹{distancePay}</Text>
            </View>

            {incentivePay > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Surge & on-time incentive</Text>
                <Text style={styles.breakdownValue}>₹{incentivePay}</Text>
              </View>
            )}

            <View style={[styles.breakdownRow, styles.breakdownRowTotal]}>
              <Text style={styles.breakdownTotalLabel}>Net Credited to Wallet</Text>
              <Text style={styles.breakdownTotalValue}>₹{orderEarnings}</Text>
            </View>
          </View>

          {/* Settlement notice */}
          <View style={styles.settlementNoticeBox}>
            <KudiIcon name="check" size={14} color="#16805A" />
            <Text style={styles.settlementNoticeText}>
              Directly settled and credited to daily partner ledger.
            </Text>
          </View>
        </View>

        {/* 4. Package & Assignment Metadata Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Package Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Type</Text>
            <Text style={styles.infoValue}>
              {order.isTryAndBuy ? 'Try & Buy Delivery' : 'Standard Delivery'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Packed Items</Text>
            <Text style={styles.infoValue}>{order.itemsCount || 1} Item(s)</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dispatch Tote</Text>
            <Text style={styles.infoValue}>{order.toteId || 'Assigned Bag'}</Text>
          </View>

          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Payment Mode</Text>
            <Text style={styles.infoValue}>Prepaid (Online)</Text>
          </View>
        </View>

        {/* 5. Support & Feedback Actions */}
        <TouchableOpacity
          style={styles.primaryActionButton}
          activeOpacity={0.85}
          onPress={() => {
            toast.info(`E-receipt for order ${order.id} sent to registered mobile.`);
          }}
        >
          <Text style={styles.primaryActionButtonText}>Download E-Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryHelpBtn}
          activeOpacity={0.7}
          onPress={() => {
            toast.info(`Query raised for order ${order.id}. Support team will contact you.`);
          }}
        >
          <KudiIcon name="help-circle" size={16} color={colors.textSecondary} />
          <Text style={styles.secondaryHelpText}>Have an issue with this trip?</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};
