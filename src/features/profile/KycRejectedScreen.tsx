import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { KudiIcon } from '../../components/KudiIcon';


export const KycRejectedScreen = () => {
  const { setKycStatus } = useAuthStore();

  const handleResubmit = () => {
    // Navigate to submission screen by changing status
    setKycStatus('NOT_SUBMITTED');
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>KudiCart | Fleet Partner</Text>
        <Text style={styles.headerHelp}>Need Help?</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <View style={styles.shieldIconContainer}>
            <KudiIcon name="shield-cross" color={colors.danger} size={32} />
          </View>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>VERIFICATION NOT APPROVED</Text>
          </View>
          <Text style={styles.title}>KYC Verification Rejected</Text>
          <Text style={styles.subtitle}>
            Your submitted driver and vehicle verification information could not be verified by Fleet Operations.
          </Text>
          <View style={styles.auditRefContainer}>
            <Text style={styles.auditRefText}>AUDIT REF: KC-FLT-849201</Text>
          </View>
        </View>

        {/* Verification Notice */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeaderRow}>
            <View style={styles.noticeHeaderLeft}>
              <KudiIcon name="info-circle" color={colors.danger} size={16} />
              <Text style={styles.noticeTitle}>VERIFICATION NOTICE</Text>
            </View>
            <View style={styles.backendBadge}>
              <Text style={styles.backendBadgeText}>Backend Status: REJECTED</Text>
            </View>
          </View>
          <View style={styles.noticeContentBox}>
            <View style={styles.reasonHeaderRow}>
              <Text style={styles.reasonLabel}>REASON PROVIDED BY FLEET OPERATIONS</Text>
              <Text style={styles.auditCode}>AUDIT_CODE: KYC_DOC_UNREADABLE</Text>
            </View>
            <Text style={styles.reasonText}>
              "The uploaded National Identity (Govt ID) document image is blurry and the license expiry date could not be validated against the regional database."
            </Text>
          </View>
        </View>

        {/* Submitted Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionLabel}>SUBMITTED VERIFICATION ITEMS</Text>
          
          <View style={styles.itemCard}>
            <View style={styles.itemIconBox}>
              <KudiIcon name="document" color={colors.success} size={20} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Commercial Driver License</Text>
              <Text style={styles.itemSubtitle}>DL - •••• 9024</Text>
            </View>
            <View style={[styles.statusBadge, styles.statusBadgeSuccess]}>
              <KudiIcon name="check-circle" color={colors.success} size={12} />
              <Text style={styles.statusBadgeTextSuccess}>Verified</Text>
            </View>
          </View>

          <View style={[styles.itemCard, styles.itemCardError]}>
            <View style={[styles.itemIconBox, styles.itemIconBoxError]}>
              <KudiIcon name="document" color={colors.danger} size={20} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>National ID / Govt ID</Text>
              <Text style={styles.itemSubtitleError}>Blurry image • Unreadable</Text>
            </View>
            <View style={[styles.statusBadge, styles.statusBadgeError]}>
              <KudiIcon name="error-circle" color={colors.danger} size={12} />
              <Text style={styles.statusBadgeTextError}>Requires Resubmission</Text>
            </View>
          </View>

          <View style={styles.itemCard}>
            <View style={styles.itemIconBox}>
              <KudiIcon name="vehicle" color={colors.success} size={20} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Vehicle RC (EV Commercial)</Text>
              <Text style={styles.itemSubtitle}>KA-05-••••41</Text>
            </View>
            <View style={[styles.statusBadge, styles.statusBadgeSuccess]}>
              <KudiIcon name="check-circle" color={colors.success} size={12} />
              <Text style={styles.statusBadgeTextSuccess}>Verified</Text>
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <KudiIcon name="lock" color={colors.textSecondary} size={16} />
          <Text style={styles.infoBoxText}>
            Central Dispatch operations and order assignments are paused until KYC verification is successfully approved.
          </Text>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <PrimaryButton title="Resubmit KYC" onPress={handleResubmit} />
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Back to Profile</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h4, color: '#1A2C5B' },
  headerHelp: { ...typography.bodyMedium, color: colors.primary },
  scrollContainer: { padding: spacing.l, paddingBottom: spacing.xxxl },
  
  statusHeader: { alignItems: 'center', marginBottom: spacing.xl },
  shieldIconContainer: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FFEBEB',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.m,
  },
  badgeContainer: {
    backgroundColor: '#FFEBEB',
    paddingHorizontal: spacing.m, paddingVertical: 4,
    borderRadius: 12, marginBottom: spacing.m,
  },
  badgeText: { ...typography.caption, color: colors.danger, fontWeight: '700' },
  title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.s },
  subtitle: { ...typography.body, textAlign: 'center', color: colors.textSecondary, marginBottom: spacing.m },
  auditRefContainer: {
    backgroundColor: colors.background, paddingHorizontal: spacing.s, paddingVertical: 4, borderRadius: 4,
  },
  auditRefText: { ...typography.caption, fontFamily: 'monospace' },
  
  noticeCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1, borderColor: '#FED7D7', borderRadius: 12,
    padding: spacing.m, marginBottom: spacing.xl,
  },
  noticeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m },
  noticeHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  noticeTitle: { ...typography.bodyMedium, color: colors.danger, fontWeight: '700' },
  backendBadge: { backgroundColor: '#FED7D7', paddingHorizontal: spacing.s, paddingVertical: 2, borderRadius: 4 },
  backendBadgeText: { ...typography.caption, color: colors.danger, fontWeight: '700' },
  noticeContentBox: { backgroundColor: colors.surface, padding: spacing.m, borderRadius: 8, borderWidth: 1, borderColor: '#FED7D7' },
  reasonHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.s },
  reasonLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  auditCode: { ...typography.caption, fontFamily: 'monospace', color: colors.textMuted },
  reasonText: { ...typography.body, fontStyle: 'italic', color: colors.text },

  itemsSection: { marginBottom: spacing.xl },
  sectionLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', marginBottom: spacing.m },
  itemCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: spacing.m, marginBottom: spacing.s,
  },
  itemCardError: { backgroundColor: '#FFF5F5', borderColor: '#FED7D7' },
  itemIconBox: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.m,
  },
  itemIconBoxError: { backgroundColor: '#FED7D7' },
  itemContent: { flex: 1 },
  itemTitle: { ...typography.bodyMedium, fontWeight: '600' },
  itemSubtitle: { ...typography.caption, color: colors.textSecondary },
  itemSubtitleError: { ...typography.caption, color: colors.danger },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.s, paddingVertical: 4, borderRadius: 4, gap: 4 },
  statusBadgeSuccess: { backgroundColor: '#E6F4EA' },
  statusBadgeTextSuccess: { ...typography.caption, color: colors.success, fontWeight: '600' },
  statusBadgeError: { backgroundColor: '#FED7D7' },
  statusBadgeTextError: { ...typography.caption, color: colors.danger, fontWeight: '600' },

  infoBox: { flexDirection: 'row', backgroundColor: colors.background, padding: spacing.m, borderRadius: 8, gap: spacing.s, alignItems: 'flex-start' },
  infoBoxText: { flex: 1, ...typography.bodySmall },

  footer: { padding: spacing.l, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  secondaryButton: { marginTop: spacing.m, alignItems: 'center', paddingVertical: spacing.s },
  secondaryButtonText: { ...typography.body, color: colors.text, fontWeight: '600' },
});
