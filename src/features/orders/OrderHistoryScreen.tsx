import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useOrderStore } from '../../store/useOrderStore';
import { useDriverStore } from '../../store/useDriverStore';
import { KudiIcon } from '../../components/KudiIcon';

export const OrderHistoryScreen = ({ navigation }: any) => {
  const { historicalOrders } = useOrderStore();

  const handleOrderPress = (orderId: string) => {
    if (navigation?.navigate) {
      navigation.navigate('HistoricalOrderDetail', { orderId });
    }
  };

  const handleBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate?.('MainApp');
    }
  };

  return (
    <ScreenContainer>
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
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {historicalOrders && historicalOrders.length > 0 ? (
          historicalOrders.map(order => {
            const orderKm = order.distance || '2.4 km';
            const orderEarnings = order.earnings || 55;

            return (
              <View key={order.id} style={styles.card}>
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => handleOrderPress(order.id)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`View details for order ${order.id}`}
                >
                  <View style={styles.orderTopRow}>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{order.status || 'DELIVERED'}</Text>
                    </View>
                  </View>

                  <View style={styles.orderSubRow}>
                    <Text style={styles.date}>{order.date || 'Today'}</Text>

                    <View style={styles.quickStatsRow}>
                      <View style={styles.distancePill}>
                        <Text style={styles.distancePillText}>{orderKm}</Text>
                      </View>

                      <View style={styles.earningsPill}>
                        <Text style={styles.earningsPillText}>₹{orderEarnings}.00</Text>
                      </View>

                      <KudiIcon
                        name="chevron-right"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No historical completed orders found.</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2DED7',
    gap: 8,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  container: {
    padding: spacing.m,
    paddingBottom: spacing.xl * 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: spacing.m,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: spacing.m,
  },
  orderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    backgroundColor: '#EDFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16805A',
  },
  orderSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  quickStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distancePill: {
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  distancePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  earningsPill: {
    backgroundColor: '#EDFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  earningsPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16805A',
  },
  expandedBody: {
    borderTopWidth: 1,
    borderTopColor: '#F3F1EC',
    backgroundColor: '#FAF9F6',
    padding: spacing.m,
  },
  routeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: spacing.m,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconStore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  iconDest: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD6C5',
  },
  routeContent: {
    flex: 1,
  },
  labelStore: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16805A',
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  labelDest: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  routeAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  connectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    marginLeft: 15,
  },
  connectorLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E2DED7',
  },
  distBadge: {
    marginLeft: 14,
    backgroundColor: '#F3F1EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  distBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#65635F',
  },
  payoutSummaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  summaryBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F1EC',
  },
  breakdownNote: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  settledBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16805A',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

