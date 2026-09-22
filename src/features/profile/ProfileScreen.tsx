import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';

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
          <Text style={styles.helpIcon}>❓</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card */}
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
              <Text style={styles.role}>{profile.role}</Text>
              <View style={styles.idBadge}>
                <Text style={styles.idText}>ID: {profile.id}</Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.contactRow}>
            <Text style={styles.phoneText}>📞 {profile.phone}</Text>
            <Text style={styles.tierText}>🛡️ {profile.tier}</Text>
          </View>
        </View>

        {/* KYC Card */}
        <View style={styles.card}>
          <View style={styles.kycHeader}>
            <Text style={styles.kycTitle}>🛡️ KYC Status</Text>
            <View style={styles.kycApprovedBadge}>
              <Text style={styles.kycApprovedText}>✅ KYC Approved</Text>
            </View>
          </View>
          <Text style={styles.kycDesc}>
            Identity, commercial driving license, and vehicle registration are verified by Fleet Operations.
          </Text>
          
          <View style={styles.docRow}>
            <Text style={styles.docTitle}>🪪 Driver License</Text>
            <Text style={styles.docStatus}>✅ {kyc.licenseStatus}</Text>
          </View>
          <Text style={styles.docSubtitle}>{kyc.licenseNumber}</Text>

          <View style={styles.docRow}>
            <Text style={styles.docTitle}>🆔 National ID (Aadhaar)</Text>
            <Text style={styles.docStatus}>✅ {kyc.aadhaarStatus}</Text>
          </View>
          <Text style={styles.docSubtitle}>{kyc.aadhaarNumber}</Text>

          <View style={styles.docRow}>
            <Text style={styles.docTitle}>📄 Vehicle RC</Text>
            <Text style={styles.docStatus}>✅ {vehicle.rcStatus}</Text>
          </View>
          <Text style={styles.docSubtitle}>{vehicle.rcNumber}</Text>

          <View style={styles.lockRow}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockText}>
              Backend verified. Changes require Fleet Admin audit.
            </Text>
          </View>
        </View>

        {/* Personal Info Card */}
        <View style={styles.card}>
          <View style={styles.kycHeader}>
            <Text style={styles.kycTitle}>👤 Personal Information</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>✏️ Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.infoValue}>{profile.name}</Text>
              <Text style={styles.editableText}>Editable</Text>
            </View>
          </View>
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.s,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  phoneText: {
    ...typography.bodyMedium,
  },
  tierText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  kycTitle: {
    ...typography.h3,
  },
  kycApprovedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.success,
  },
  kycApprovedText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
  kycDesc: {
    ...typography.bodySmall,
    marginBottom: spacing.m,
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
