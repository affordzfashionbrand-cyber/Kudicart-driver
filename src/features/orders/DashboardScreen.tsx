import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';
import { useOrderStore } from '../../store/useOrderStore';

export const DashboardScreen = ({ navigation }: any) => {
  const { profile, isOnline, setIsOnline } = useDriverStore();
  const { activeOrders } = useOrderStore();
  
  const activeOrder = activeOrders.length > 0 ? activeOrders[0] : null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: spacing.s }}>
            <Text style={styles.greeting} numberOfLines={1}>Good morning, {profile.name.split(' ')[0]}</Text>
            <Text style={styles.subGreeting} numberOfLines={1}>{profile.role} • ID: {profile.id}</Text>
          </View>
          <View style={styles.kycBadge}>
            <Text style={styles.kycBadgeText}>KYC Approved</Text>
          </View>
        </View>

        <View style={styles.availabilityCard}>
          <View style={styles.availabilityInfo}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.textMuted }]} />
            <View>
              <Text style={styles.availabilityTitle}>{isOnline ? "You're Online" : "You're Offline"}</Text>
              <Text style={styles.availabilityDesc}>
                {isOnline ? "Available to receive assigned deliveries from Fleet Dispatch" : "Not receiving new deliveries"}
              </Text>
            </View>
          </View>
          <Switch 
            value={isOnline} 
            onValueChange={setIsOnline} 
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {activeOrder && (
          <View style={styles.activeAssignmentCard}>
            <View style={styles.assignmentHeader}>
              <Text style={styles.assignmentTitle}>ACTIVE ASSIGNMENT</Text>
              <View style={styles.badgeRow}>
                <View style={styles.idBadge}><Text style={styles.idBadgeText}>{activeOrder.id}</Text></View>
                <View style={styles.statusBadge}><Text style={styles.statusBadgeText}>{activeOrder.status}</Text></View>
              </View>
            </View>
            
            <View style={styles.locationBlock}>
              <Text style={styles.locationTitle} numberOfLines={1}>{activeOrder.pickupLocation}</Text>
              <Text style={styles.locationDesc}>
                {activeOrder.pickupTime ? `Pickup completed at ${activeOrder.pickupTime}` : `Pickup pending`} • {activeOrder.itemsCount} items (Tote {activeOrder.toteId})
              </Text>
            </View>

            <View style={styles.locationBlock}>
              <View style={styles.customerRow}>
                <Text style={styles.locationTitle}>Customer: {activeOrder.customerName}</Text>
                <Text style={styles.distanceText}>{activeOrder.distance}</Text>
              </View>
              <Text style={styles.locationDesc}>{activeOrder.customerAddress}</Text>
              <Text style={styles.etaText}>🕒 Est. delivery by {activeOrder.eta}</Text>
            </View>

            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={() => navigation.navigate('OrderDetails', { orderId: activeOrder.id })}
            >
              <Text style={styles.continueButtonText}>Continue Delivery →</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Operational Desk</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Orders')}>
            <View style={styles.cardHeader}>
               <Text>📋</Text>
               <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>{activeOrders.length} Active</Text></View>
            </View>
            <Text style={styles.cardTitle}>Assigned Orders</Text>
            <Text style={styles.cardDesc}>Current queue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('History')}>
            <View style={styles.cardHeader}>
               <Text>🕒</Text>
            </View>
            <Text style={styles.cardTitle}>Order History</Text>
            <Text style={styles.cardDesc}>Completed runs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Profile')}>
             <View style={styles.cardHeader}>
               <Text>👤</Text>
            </View>
            <Text style={styles.cardTitle}>Fleet Profile</Text>
            <Text style={styles.cardDesc}>Vehicle & KYC</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridCard}>
             <View style={styles.cardHeader}>
               <Text>🎧</Text>
               <View style={styles.statusDotSm} />
            </View>
            <Text style={styles.cardTitle}>Partner Support</Text>
            <Text style={styles.cardDesc}>Dispatch Desk</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.l,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.l,
  },
  greeting: {
    ...typography.h2,
  },
  subGreeting: {
    ...typography.bodySmall,
  },
  kycBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
  },
  kycBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
  availabilityCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.m,
  },
  availabilityTitle: {
    ...typography.h4,
  },
  availabilityDesc: {
    ...typography.caption,
    flexShrink: 1,
  },
  activeAssignmentCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.l,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 4,
    borderTopColor: colors.primary,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  assignmentTitle: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  idBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  idBadgeText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  locationBlock: {
    marginBottom: spacing.m,
  },
  locationTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  locationDesc: {
    ...typography.caption,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distanceText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  etaText: {
    ...typography.caption,
    color: colors.primaryDark,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: colors.primaryDark,
    padding: spacing.m,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.s,
  },
  continueButtonText: {
    ...typography.button,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.m,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
    justifyContent: 'space-between',
  },
  gridCard: {
    backgroundColor: colors.surface,
    width: '47%',
    padding: spacing.m,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: spacing.m,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  activeBadge: {
    backgroundColor: '#EAEFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  statusDotSm: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  cardTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  cardDesc: {
    ...typography.caption,
  },
});
