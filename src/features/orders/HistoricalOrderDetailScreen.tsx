import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useOrderStore, Order } from '../../store/useOrderStore';
import { useDriverStore } from '../../store/useDriverStore';
import { KudiIcon } from '../../components/KudiIcon';
import { toast } from '../../store/useToastStore';

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
              <Text style={styles.statusSubtitle}>{order.date || 'Delivered Today'}</Text>
            </View>
          </View>
        </View>

        {/* 2. From & To Trajectory Route Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Delivery Route</Text>

          <View style={styles.routeContainer}>
            {/* FROM: Our Darkstore */}
            <View style={styles.routePointRow}>
              <View style={styles.routeIconStore}>
                <KudiIcon name="home" size={17} color="#16805A" />
              </View>
              <View style={styles.routeContent}>
                <Text style={styles.routeLabelStore}>From (Our Store)</Text>
                <Text style={styles.routeStoreName}>{storeName}</Text>
                <Text style={styles.routeStoreAddress}>{storeAddress}</Text>
              </View>
            </View>

            {/* Connecting Route Line with Distance */}
            <View style={styles.routeConnectorRow}>
              <View style={styles.routeConnectorLine} />
              <View style={styles.distanceBadge}>
                <KudiIcon name="navigation" size={12} color={colors.primary} />
                <Text style={styles.distanceBadgeText}>{orderKm} Total Delivery Distance</Text>
              </View>
            </View>

            {/* TO: Customer Address */}
            <View style={styles.routePointRow}>
              <View style={styles.routeIconDest}>
                <KudiIcon name="navigation" size={17} color={colors.primary} />
              </View>
              <View style={styles.routeContent}>
                <Text style={styles.routeLabelDest}>To (Customer Address)</Text>
                <Text style={styles.routeCustomerName}>{customerName}</Text>
                <Text style={styles.routeCustomerAddress}>{customerAddress}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Earnings & Payout Breakdown Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Earnings & Payout Summary</Text>

          {/* Highlight Hero Row */}
          <View style={styles.earningsHeroRow}>
            <View>
              <Text style={styles.earningsHeroLabel}>Total Earned for Order</Text>
              <Text style={styles.earningsHeroDistance}>{orderKm} completed delivery</Text>
            </View>
            <Text style={styles.earningsHeroValue}>₹{orderEarnings}.00</Text>
          </View>

          {/* Itemized Payout Breakdown */}
          <View style={styles.payoutBreakdownBox}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Base Delivery Fee</Text>
              <Text style={styles.breakdownValue}>₹{basePay}.00</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Distance Allowance</Text>
              <Text style={styles.breakdownValue}>₹{distancePay}.00</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>On-Time Delivery Incentive</Text>
              <Text style={styles.breakdownValue}>₹{incentivePay}.00</Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Customer Tip</Text>
              <Text style={styles.breakdownValue}>₹0.00</Text>
            </View>

            <View style={[styles.breakdownRow, styles.breakdownRowTotal]}>
              <Text style={styles.breakdownTotalLabel}>Net Credited Payout</Text>
              <Text style={styles.breakdownTotalValue}>₹{orderEarnings}.00</Text>
            </View>
          </View>

          {/* Settlement Badge */}
          <View style={styles.settlementNoticeBox}>
            <KudiIcon name="check-circle" size={16} color="#16805A" />
            <Text style={styles.settlementNoticeText}>
              Settled to Partner Ledger • Transferred via weekly bank payout
            </Text>
          </View>
        </View>

        {/* 4. Package & Order Specifics Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Package Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Reference</Text>
            <Text style={styles.infoValue}>{order.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Assigned Tote</Text>
            <Text style={styles.infoValue}>{order.toteId || '#T-08'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Items Delivered</Text>
            <Text style={styles.infoValue}>{order.itemsCount || 3} Units</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery Category</Text>
            <Text style={styles.infoValue}>
              {order.isTryAndBuy ? 'Try & Buy Instant Service' : 'Darkstore Instant Delivery'}
            </Text>
          </View>

          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Payment Mode</Text>
            <Text style={[styles.infoValue, { color: '#16805A' }]}>Paid Online (Verified)</Text>
          </View>
        </View>

        {/* 5. Navigation & Help Actions */}
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={handleBack}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Back to Order History"
        >
          <Text style={styles.primaryActionButtonText}>Back to Order History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryHelpBtn}
          onPress={() => toast.info('Support ticket logged for this order. Hub manager notified.')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Need help with this order"
        >
          <KudiIcon name="help" size={16} color={colors.textSecondary} />
          <Text style={styles.secondaryHelpText}>Need Help with this Order?</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.m,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerIdBadge: {
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD6C5',
  },
  headerIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  container: {
    padding: spacing.m,
    paddingBottom: spacing.xl * 2,
  },

  /* 1. Status Banner */
  statusBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: spacing.m,
  },
  statusBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F4ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  deliveredPill: {
    backgroundColor: '#E8F4ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C1F2D9',
  },
  deliveredPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16805A',
  },
  statusSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  /* Generic Card Styles */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: spacing.m,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.s,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F1EC',
  },

  /* 2. Route Trajectory */
  routeContainer: {
    paddingVertical: 4,
  },
  routePointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeIconStore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F4ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  routeIconDest: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  routeContent: {
    flex: 1,
  },
  routeLabelStore: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16805A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  routeLabelDest: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  routeStoreName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  routeStoreAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  routeCustomerName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  routeCustomerAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  routeConnectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 15,
    gap: 12,
  },
  routeConnectorLine: {
    width: 2,
    height: 28,
    backgroundColor: '#E2DED7',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E2DED7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },

  /* 3. Earnings & Payout Breakdown */
  earningsHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0E8',
    borderRadius: 12,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#FFD6C5',
    marginBottom: spacing.m,
  },
  earningsHeroLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  earningsHeroDistance: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  earningsHeroValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16805A',
  },
  payoutBreakdownBox: {
    backgroundColor: '#FAF9F6',
    borderRadius: 10,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginBottom: spacing.s,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  breakdownRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E2DED7',
    marginTop: 6,
    paddingTop: 10,
  },
  breakdownLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  breakdownTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  breakdownTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16805A',
  },
  settlementNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F4ED',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  settlementNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#16805A',
    fontWeight: '600',
  },

  /* 4. Package Info Rows */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F6F2',
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },

  /* Actions */
  primaryActionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.m,
  },
  primaryActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  secondaryHelpText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
