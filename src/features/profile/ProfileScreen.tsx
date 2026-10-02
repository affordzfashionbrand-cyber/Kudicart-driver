import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';
import { KudiIcon } from '../../components/KudiIcon';

export const ProfileScreen = () => {
  const { profile, vehicle, kyc } = useDriverStore();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Driver Profile</Text>
          <Text style={styles.headerSubtitle}>Account & Verification Sync</Text>
        </View>
        <TouchableOpacity>
          <KudiIcon name="help" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Driver Identity */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.avatarInitial}</Text>
              <View style={styles.statusDot} />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profile.name}</Text>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeBadgeText}>{profile.status}</Text>
                </View>
              </View>
              <Text style={styles.role}>{profile.role || 'Delivery Partner'}</Text>
              <View style={styles.idBadge}>
                <Text style={styles.idText}>ID: {profile.id}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Partner Information */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}><KudiIcon name="user" size={18} color={colors.primary} /> Delivery Partner Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{profile.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>{profile.dob || '15/08/1990'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Driving License</Text>
            <Text style={styles.infoValue}>{profile.licenseNumber}</Text>
          </View>
        </View>

        {/* Work Type */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}><KudiIcon name="briefcase" size={18} color={colors.primary} /> Work Type</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Employment Type</Text>
            <Text style={styles.infoValue}>
              {profile.workPreference === 'FULL_TIME' ? 'Full-Time' : profile.workPreference === 'PART_TIME' ? 'Part-Time' : 'Not Selected'}
            </Text>
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}><KudiIcon name="clipboard" size={18} color={colors.primary} /> Vehicle Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registration Number</Text>
            <Text style={styles.infoValue}>{vehicle.registrationNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehicle Type</Text>
            <Text style={styles.infoValue}>{vehicle.vehicleType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Make & Model</Text>
            <Text style={styles.infoValue}>{vehicle.make} {vehicle.model}</Text>
          </View>
        </View>

        {/* Documents & Verification */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}><KudiIcon name="document" size={18} color={colors.primary} /> Documents & Verification</Text>
          </View>
          
          <View style={styles.docRow}>
            <Text style={styles.docTitle}>Driving Licence</Text>
            <Text style={styles.docStatus}><KudiIcon name="check-circle" size={14} color={colors.success} /> {kyc.licenseStatus || 'Verified'}</Text>
          </View>
          <Text style={styles.docSubtitle}>{profile.licenseNumber}</Text>

          <View style={styles.docRow}>
            <Text style={styles.docTitle}>Aadhaar</Text>
            <Text style={styles.docStatus}><KudiIcon name="check-circle" size={14} color={colors.success} /> {kyc.aadhaarStatus || 'Verified'}</Text>
          </View>
          <Text style={styles.docSubtitle}>{profile.aadhaarNumber}</Text>

          <View style={styles.docRow}>
            <Text style={styles.docTitle}>PAN</Text>
            <Text style={styles.docStatus}><KudiIcon name="check-circle" size={14} color={colors.success} /> Verified</Text>
          </View>
          <Text style={styles.docSubtitle}>{profile.panNumber}</Text>

          <View style={styles.docRow}>
            <Text style={styles.docTitle}>Vehicle RC</Text>
            <Text style={styles.docStatus}><KudiIcon name="check-circle" size={14} color={colors.success} /> {vehicle.rcStatus || 'Verified'}</Text>
          </View>
          <Text style={styles.docSubtitle}>{vehicle.registrationNumber || vehicle.rcNumber}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.l,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.primaryDark,
  },
  headerSubtitle: {
    ...typography.caption,
  },
  helpIcon: {
    fontSize: 24,
  },
  container: {
    padding: spacing.m,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.m,
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileRow: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  avatarText: {
    ...typography.h2,
    color: colors.white,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    ...typography.h4,
    flexShrink: 1,
    marginRight: spacing.s,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 4,
  },
  activeBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
  role: {
    ...typography.caption,
    marginBottom: spacing.s,
  },
  idBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  idText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  sectionTitle: {
    ...typography.h3,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: spacing.s,
    borderRadius: 8,
    marginTop: spacing.s,
  },
  docTitle: {
    ...typography.bodyMedium,
  },
  docStatus: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
  docSubtitle: {
    ...typography.caption,
    paddingHorizontal: spacing.s,
    paddingBottom: spacing.s,
    backgroundColor: '#F9FAFB',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  lockRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: spacing.m,
    borderRadius: 8,
    marginTop: spacing.l,
    alignItems: 'center',
  },
  lockIcon: {
    marginRight: spacing.s,
  },
  lockText: {
    ...typography.caption,
    flex: 1,
  },
  editButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.m,
  },
  infoLabel: {
    ...typography.bodySmall,
  },
  infoValue: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  editableText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
});
