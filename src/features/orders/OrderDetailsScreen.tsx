import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useOrderStore } from '../../store/useOrderStore';

export const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params || {};
  const { activeOrders, confirmPickup, startDelivery, confirmDelivery } = useOrderStore();
  
  const order = activeOrders.find(o => o.id === orderId);

  if (!order) {
    return (
      <ScreenContainer>
        <View style={styles.header}><Text style={styles.headerTitle}>Order Not Found</Text></View>
        <View style={styles.container}><Text>This order has been completed or does not exist.</Text></View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Details {order.id}</Text>
        <Text style={styles.statusBadgeText}>{order.status}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pickup</Text>
          <Text style={styles.body}>{order.pickupLocation}</Text>
          <Text style={styles.body}>Items: {order.itemsCount} (Tote {order.toteId})</Text>
          
          {order.status === 'ASSIGNED' && (
            <View style={styles.actionRow}>
              <PrimaryButton title="Navigate to Pickup" onPress={() => console.log('Mock Map Pickup')} />
              <PrimaryButton title="Confirm Pickup" onPress={() => confirmPickup(order.id)} />
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery</Text>
          <Text style={styles.body}>Customer: {order.customerName}</Text>
          <Text style={styles.body}>{order.customerAddress}</Text>
          
          {order.status === 'PICKED_UP' && (
            <View style={styles.actionRow}>
              <PrimaryButton title="Start Delivery" onPress={() => startDelivery(order.id)} />
            </View>
          )}

          {order.status === 'OUT_FOR_DELIVERY' && (
            <View style={styles.actionRow}>
              <PrimaryButton title="Navigate to Delivery" onPress={() => console.log('Mock Map Delivery')} />
              <PrimaryButton title="Confirm Delivery" onPress={() => {
                confirmDelivery(order.id);
                navigation.goBack();
              }} />
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { padding: spacing.l, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border },
  headerTitle: { ...typography.h3 },
  statusBadgeText: { ...typography.caption, color: colors.primaryDark, fontWeight: '700', marginTop: spacing.xs },
  container: { padding: spacing.m },
  card: { padding: spacing.m, backgroundColor: colors.surface, borderRadius: 12, marginBottom: spacing.m, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { ...typography.h4, marginBottom: spacing.s },
  body: { ...typography.body, marginBottom: spacing.s },
  actionRow: { marginTop: spacing.m, gap: spacing.s },
});
