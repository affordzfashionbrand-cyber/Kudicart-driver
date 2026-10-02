import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { KudiIcon } from '../../components/KudiIcon';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';

export const StoreDetailsScreen = ({ navigation }: any) => {
  const { assignedStore } = useDriverStore();

  const handleNavigate = () => {
    if (assignedStore?.address) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(assignedStore.address)}`);
    }
  };

  const handleCall = () => {
    Linking.openURL('tel:+919876543210'); // Mock manager contact
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <KudiIcon name="arrow-left" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Store</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.storeCard}>
          <Text style={styles.sectionTitle}>Store Details</Text>
          <View style={styles.storeHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>{assignedStore?.name || 'Assigned Store'}</Text>
              <Text style={styles.storeAddress}>{assignedStore?.address || 'Address not available'}</Text>
            </View>
            <TouchableOpacity style={styles.navigateIconBtn} onPress={handleNavigate}>
              <KudiIcon name="navigation" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Store Manager</Text>
          <View style={styles.managerCard}>
            <View style={styles.managerAvatar}>
              <Text style={styles.managerInitials}>SM</Text>
            </View>
            <View style={styles.managerInfo}>
              <Text style={styles.managerName}>Sandeep Sharma</Text>
              <Text style={styles.managerRole}>Hub Manager</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
              <KudiIcon name="phone" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.primaryDark,
  },
  content: {
    padding: spacing.m,
  },
  storeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeName: {
    ...typography.h3,
    color: '#1A2C5B',
    marginBottom: spacing.xs,
  },
  storeAddress: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  navigateIconBtn: {
    padding: 8,
    backgroundColor: '#EAEFFF',
    borderRadius: 8,
    marginLeft: spacing.m,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: spacing.l,
  },
  sectionTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.m,
  },
  managerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  managerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAEFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  managerInitials: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primary,
  },
  managerInfo: {
    flex: 1,
  },
  managerName: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: '#1A2C5B',
  },
  managerRole: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
