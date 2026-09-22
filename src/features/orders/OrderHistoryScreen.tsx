import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useOrderStore } from '../../store/useOrderStore';

export const OrderHistoryScreen = () => {
  const { historicalOrders } = useOrderStore();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {historicalOrders.map(order => (
          <View key={order.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>{order.id}</Text>
              <View style={styles.statusBadge}><Text style={styles.statusText}>{order.status}</Text></View>
            </View>
            <Text style={styles.date}>{order.date}</Text>
            <Text style={styles.address}>Customer: {order.customerName}</Text>
          </View>
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
  statusBadge: { backgroundColor: colors.success, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { ...typography.caption, color: colors.white, fontWeight: 'bold' },
  date: { ...typography.bodyMedium, color: colors.textSecondary, marginTop: spacing.xs },
  address: { ...typography.bodyMedium, color: colors.text, marginTop: spacing.xs }
});
