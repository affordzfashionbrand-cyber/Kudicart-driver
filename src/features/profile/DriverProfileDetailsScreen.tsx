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
import { useDriverStore } from '../../store/useDriverStore';
import { KudiIcon } from '../../components/KudiIcon';

const maskDl = (dl?: string) => {
  if (!dl) return 'Not available';
  const clean = dl.replace(/\s+/g, '');
  if (clean.length < 8) return dl;
  const prefix = clean.slice(0, 5);
  const suffix = clean.slice(-4);
  return `${prefix} •••••• ${suffix}`;
};

export const DriverProfileDetailsScreen = ({ navigation }: any) => {
  const { profile, vehicle, fetchProfileAsync } = useDriverStore();

  React.useEffect(() => {
    fetchProfileAsync?.();
  }, [fetchProfileAsync]);

  const driverFullName = profile.fullName || profile.name || 'Delivery Partner';
  const isPartTime = profile.workPreference !== 'FULL_TIME';
  const partnerId = profile.id || 'Pending Assignment';

  const handleBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('MainApp');
    }
  };

  return (
    <ScreenContainer>
      {/* 1. Top Header with left-aligned title "Driver Details" */}
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
        <Text style={styles.headerTitle}>Driver Details</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Personal Details Card (without Registered Vehicle) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Personal Details</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Full Name</Text>
            <Text style={styles.rowValue}>{driverFullName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Partner ID</Text>
            <Text style={styles.rowValue}>{partnerId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Registered Phone</Text>
            <Text style={styles.rowValue}>{profile.phone || '+91 98765 43210'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Date of Birth</Text>
            <Text style={styles.rowValue}>{profile.dob || '15/08/1996'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Driving Licence</Text>
            <Text style={styles.rowValue}>{maskDl(profile.licenseNumber)}</Text>
          </View>

          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Work Preference</Text>
            <View style={styles.preferencePill}>
              <Text style={styles.preferencePillText}>
                {isPartTime ? 'Part-Time (Slot-Based)' : 'Full-Time (Shift-Based)'}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Vehicle Information Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Vehicle Information</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Registration No.</Text>
            <Text style={styles.rowValue}>{vehicle.registrationNumber || 'KA 05 MJ 4821'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Vehicle Type</Text>
            <Text style={styles.rowValue}>{vehicle.vehicleType || 'Two Wheeler (Scooter)'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Make & Model</Text>
            <Text style={styles.rowValue}>
              {vehicle.make || 'Honda'} {vehicle.model || 'Activa 6G'}
            </Text>
          </View>

          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>RC Status</Text>
            <View style={styles.statusVerifiedPill}>
              <KudiIcon name="check-circle" size={12} color="#16805A" />
              <Text style={styles.statusVerifiedText}>Verified</Text>
            </View>
          </View>
        </View>
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
    borderBottomColor: '#E2DED7',
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
  scrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.xl * 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: spacing.m,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.s,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F1EC',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F6F2',
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  rowLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  preferencePill: {
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFD6C5',
  },
  preferencePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  statusVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusVerifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16805A',
  },
});
