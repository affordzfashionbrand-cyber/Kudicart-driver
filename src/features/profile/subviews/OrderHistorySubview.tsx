import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { KudiIcon } from '../../../components/KudiIcon';
import { toast } from '../../../store/useToastStore';
import { subviewStyles as styles } from './profileSubviews.styles';

interface OrderItem {
  id: string;
  status?: string;
  distance?: string;
  earnings?: number;
  date?: string;
}

interface OrderHistorySubviewProps {
  historicalOrders?: OrderItem[];
  navigation?: any;
}

export const OrderHistorySubview: React.FC<OrderHistorySubviewProps> = ({
  historicalOrders,
  navigation,
}) => {
  const handleOrderPress = (orderId: string) => {
    if (navigation?.navigate) {
      navigation.navigate('HistoricalOrderDetail', { orderId });
    } else {
      toast.info(`Viewing details for ${orderId}`);
    }
  };

  return (
    <>
      <View style={styles.orderHistoryListContainer}>
        {historicalOrders && historicalOrders.length > 0 ? (
          historicalOrders.map((order) => {
            const orderKm = order.distance || '2.4 km';
            const orderEarnings = order.earnings || 55;

            return (
              <View key={order.id} style={styles.orderHistoryCard}>
                <TouchableOpacity
                  style={styles.orderHistoryHeader}
                  onPress={() => handleOrderPress(order.id)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`View details for order ${order.id}`}
                >
                  <View style={styles.orderHistoryTopRow}>
                    <Text style={styles.orderHistoryId}>{order.id}</Text>
                    <View style={styles.statusVerifiedPill}>
                      <Text style={styles.statusVerifiedText}>{order.status || 'DELIVERED'}</Text>
                    </View>
                  </View>

                  <View style={styles.orderHistorySubRow}>
                    <Text style={styles.orderHistoryDate}>{order.date || 'Today'}</Text>

                    <View style={styles.orderHistoryQuickStats}>
                      <View style={styles.orderDistancePill}>
                        <Text style={styles.orderDistancePillText}>{orderKm}</Text>
                      </View>

                      <View style={styles.orderEarningsBadge}>
                        <Text style={styles.orderEarningsBadgeText}>₹{orderEarnings}.00</Text>
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
          <View style={styles.card}>
            <Text style={styles.bodyText}>No historical completed orders found.</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.primaryActionButton}
        onPress={() => navigation?.navigate?.('Earnings')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="View Full Earnings Ledger"
      >
        <Text style={styles.primaryActionButtonText}>View Full Earnings Ledger</Text>
      </TouchableOpacity>
    </>
  );
};
