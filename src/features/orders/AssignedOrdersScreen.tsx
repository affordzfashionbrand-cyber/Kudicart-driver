import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useOrderStore } from '../../store/useOrderStore';

export const AssignedOrdersScreen = ({ navigation }: any) => {
  const { activeOrders } = useOrderStore();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assigned Orders</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {activeOrders.map(order => (
          <TouchableOpacity 
            key={order.id} 
            style={styles.card} 
            onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>{order.id}</Text>
              <View style={styles.statusBadge}><Text style={styles.statusText}>{order.status}</Text></View>
            </View>
            <Text style={styles.address}>Pickup: {order.pickupLocation}</Text>
            <Text style={styles.address}>Delivery: {order.distance} ({order.customerName})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { padding: spacing.l, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border },
  headerTitle: { ...typography.h3 },
  container: { padding: spacing.m },
  card: { padding: spacing.m, backgroundColor: colors.surface, borderRadius: 12, marginBottom: spacing.m, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.s },
  orderId: { ...typography.h4 },
  statusBadge: { backgroundColor: colors.info, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { ...typography.caption, color: colors.white, fontWeight: 'bold' },
  address: { ...typography.bodyMedium, color: colors.textSecondary, marginTop: spacing.xs }
});
