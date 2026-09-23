import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';

// Simple mock icon helper
const Icon = ({ name, color, size = 20 }: { name: string; color: string; size?: number }) => {
  const getIcon = () => {
    switch (name) {
      case 'arrow-left': return '←';
      case 'check-circle': return '✓';
      case 'check-badge': return '🏅';
      case 'calendar': return '📅';
      case 'document': return '📄';
      case 'shield': return '🛡️';
      case 'upload': return '↑';
      case 'id-card': return '🪪';
      default: return '•';
    }
  };
  return (
    <Text style={{ fontSize: size, color: color, textAlign: 'center', lineHeight: size * 1.2 }}>
      {getIcon()}
    </Text>
  );
};

export const KycSubmissionScreen = () => {
  const { setKycStatus } = useAuthStore();
  const [fleetType, setFleetType] = useState('Motorcycle');

  const handleSubmit = () => {
    setKycStatus('PENDING');
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton}>
            <Icon name="arrow-left" color={colors.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>KudiCart</Text>
          <Text style={styles.headerDot}>•</Text>
          <Text style={styles.headerSubtitle}>PARTNER KYC</Text>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpText}>Need Help?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Progress Step Header */}
        <View style={styles.topBadgeRow}>
          <View style={styles.badgeContainer}>
            <Icon name="shield" color={colors.primary} size={14} />
            <Text style={styles.badgeText}>FLEET ONBOARDING • STEP 02/04</Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>Complete your verification</Text>
        <Text style={styles.mainSubtitle}>
          Add your driver and vehicle details to submit your profile for verification.
        </Text>

        {/* Stepper Mock */}
        <View style={styles.stepperBox}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
              <Icon name="check-circle" color={colors.white} size={14} />
            </View>
            <Text style={[styles.stepText, styles.stepTextCompleted]}>Driver</Text>
          </View>
          <View style={[styles.stepLine, styles.stepLineCompleted]} />
          
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepCircleTextActive}>02</Text>
            </View>
            <Text style={[styles.stepText, styles.stepTextActive]}>Vehicle</Text>
          </View>
          <View style={[styles.stepLine, styles.stepLinePending]} />

          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCirclePending]}>
              <Text style={styles.stepCircleTextPending}>03</Text>
            </View>
            <Text style={[styles.stepText, styles.stepTextPending]}>Docs</Text>
          </View>
          <View style={[styles.stepLine, styles.stepLinePending]} />

          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCirclePending]}>
              <Text style={styles.stepCircleTextPending}>04</Text>
            </View>
            <Text style={[styles.stepText, styles.stepTextPending]}>Review</Text>
          </View>
        </View>

        {/* 1. Driver Identity Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardIconBox}><Icon name="id-card" color={colors.primary} size={16} /></View>
              <Text style={styles.cardTitle}>DRIVER IDENTITY</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Icon name="check-circle" color={colors.success} size={12} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>Full Legal Name <Text style={styles.required}>*</Text></Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>Babajide Samuel Adeleke</Text>
            <Icon name="check-badge" color={colors.success} size={20} />
          </View>
          <Text style={styles.helperText}>Matched automatically with partner registered account.</Text>

          <View style={styles.rowInputs}>
            <View style={styles.flexHalf}>
              <Text style={styles.inputLabel}>Date of Birth <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputBox}>
                <Text style={styles.inputText}>14 / 08 / 1994</Text>
                <Icon name="calendar" color={colors.textSecondary} size={16} />
              </View>
            </View>
            <View style={styles.spacer} />
            <View style={styles.flexHalf}>
              <Text style={styles.inputLabel}>Licence No. <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputBox}>
                <Text style={styles.inputText}>DL-1420110012345</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Vehicle Specification Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardIconBox}><Text>🚲</Text></View>
              <Text style={styles.cardTitle}>VEHICLE SPECIFICATION</Text>
            </View>
            <Text style={styles.editingText}>• Editing</Text>
          </View>

          <Text style={styles.inputLabel}>Vehicle Fleet Type <Text style={styles.required}>*</Text></Text>
          <View style={styles.tabsContainer}>
            {['Motorcycle', 'EV Bike', 'Delivery Van'].map((type) => (
              <TouchableOpacity 
                key={type} 
                style={[styles.tabButton, fleetType === type && styles.tabButtonActive]}
                onPress={() => setFleetType(type)}
              >
                <Text style={[styles.tabText, fleetType === type && styles.tabTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Vehicle Registration Number <Text style={styles.required}>*</Text></Text>
          <View style={styles.plateInputBox}>
            <View style={styles.plateStateCode}>
              <Text style={styles.plateStateText}>NG</Text>
            </View>
            <TextInput 
              style={styles.plateTextInput}
              value="LND 842 AX"
              editable={false} // Mocked
            />
          </View>
          <Text style={styles.helperText}>Must match the physical number plate & official RC document.</Text>

          <Text style={[styles.inputLabel, { marginTop: spacing.m }]}>Vehicle Make & Model <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputBox}>
            <TextInput 
              style={styles.inputText}
              value="Bajaj Boxer BM 150 / 2022"
              editable={false} // Mocked
            />
          </View>
        </View>

        {/* 3. Document Verification Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardIconBox}><Icon name="document" color={colors.primary} size={16} /></View>
              <Text style={styles.cardTitle}>DOCUMENT VERIFICATION</Text>
            </View>
            <Text style={styles.editingText}>2 of 3 Uploaded</Text>
          </View>

          <View style={styles.docUploadedItem}>
            <View style={styles.docIconBoxSuccess}><Icon name="document" color={colors.success} size={20} /></View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Driving Licence (Front & Back)</Text>
              <Text style={styles.docSubtitleSuccess}>✓ licence_front_back.jpg • 1.2MB</Text>
            </View>
            <Text style={styles.replaceText}>Replace</Text>
          </View>

          <View style={styles.docUploadedItem}>
            <View style={styles.docIconBoxSuccess}><Icon name="document" color={colors.success} size={20} /></View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>Vehicle Registration Certificate (RC)</Text>
              <Text style={styles.docSubtitleSuccess}>✓ vehicle_rc_copy.pdf • 840KB</Text>
            </View>
            <Text style={styles.replaceText}>Replace</Text>
          </View>

          <View style={styles.docPendingItem}>
            <View style={styles.docPendingTopRow}>
              <View style={styles.docIconBoxPending}><Icon name="id-card" color={colors.primary} size={20} /></View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>National ID / Govt ID</Text>
                <Text style={styles.docSubtitle}>NIN slip, Voter's Card, or Govt ID</Text>
              </View>
              <View style={styles.actionRequiredBadge}>
                <Text style={styles.actionRequiredText}>Action Required</Text>
              </View>
            </View>
            
            <View style={styles.docPendingBottomRow}>
              <Text style={styles.docSupportedText}>Supported: PDF, JPG, PNG (Max 10MB)</Text>
              <TouchableOpacity style={styles.uploadButton}>
                <Icon name="upload" color={colors.white} size={14} />
                <Text style={styles.uploadButtonText}>Upload Document →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon name="shield" color={colors.textSecondary} size={16} />
          <Text style={styles.infoBoxText}>
            All documents are encrypted with <Text style={{fontWeight: '700'}}>256-bit AES storage</Text>. Once submitted, verification typically takes <Text style={{color: colors.primary, fontWeight: '700'}}>2 to 24 hours</Text> by KudiCart Fleet Operations.
          </Text>
        </View>

      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <PrimaryButton title="Submit for Verification →" onPress={handleSubmit} />
        <Text style={styles.disclaimerText}>
          By submitting, you confirm the uploaded information and documents are authentic and valid under KudiCart Logistics Partner Terms.
        </Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.l, paddingVertical: spacing.m,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: spacing.m },
  headerTitle: { ...typography.h4, color: '#1A2C5B', fontWeight: '700' },
  headerDot: { color: colors.border, marginHorizontal: spacing.s },
  headerSubtitle: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  helpButton: { backgroundColor: '#F0F4FF', paddingHorizontal: spacing.m, paddingVertical: spacing.s, borderRadius: 16 },
  helpText: { ...typography.bodyMedium, color: colors.primary, fontWeight: '600' },
  
  scrollContainer: { padding: spacing.l, paddingBottom: spacing.xxxl },
  
  topBadgeRow: { marginBottom: spacing.m },
  badgeContainer: { 
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#F0F4FF', paddingHorizontal: spacing.m, paddingVertical: spacing.xs, borderRadius: 16, gap: spacing.xs 
  },
  badgeText: { ...typography.caption, color: colors.primary, fontWeight: '700', letterSpacing: 0.5 },
  
  mainTitle: { ...typography.h1, color: '#1A2C5B', marginBottom: spacing.xs },
  mainSubtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  
  stepperBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, padding: spacing.l,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  stepItem: { alignItems: 'center' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  stepCircleCompleted: { backgroundColor: colors.primaryDark },
  stepCircleActive: { backgroundColor: colors.primary },
  stepCirclePending: { backgroundColor: '#F4F4F4', borderWidth: 1, borderColor: colors.border },
  stepCircleTextActive: { ...typography.caption, color: colors.white, fontWeight: '700' },
  stepCircleTextPending: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  stepText: { ...typography.caption, marginTop: spacing.xs, fontWeight: '600' },
  stepTextCompleted: { color: colors.primaryDark },
  stepTextActive: { color: colors.primary },
  stepTextPending: { color: colors.textMuted },
  stepLine: { flex: 1, height: 2, marginHorizontal: spacing.s, marginBottom: 20 },
  stepLineCompleted: { backgroundColor: colors.primaryDark },
  stepLinePending: { backgroundColor: colors.border },

  card: {
    backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    padding: spacing.l, marginBottom: spacing.l,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.l },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  cardIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
  cardTitle: { ...typography.bodyMedium, fontWeight: '700', letterSpacing: 0.5 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F4EA', paddingHorizontal: spacing.s, paddingVertical: 4, borderRadius: 12, gap: 4 },
  verifiedText: { ...typography.caption, color: colors.success, fontWeight: '600' },
  editingText: { ...typography.caption, color: '#D97706', fontWeight: '700' },

  inputLabel: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.xs },
  required: { color: colors.danger },
  readOnlyInput: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, padding: spacing.m, marginBottom: spacing.xs,
  },
  readOnlyText: { ...typography.body, color: colors.text },
  helperText: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.m },
  
  rowInputs: { flexDirection: 'row' },
  flexHalf: { flex: 1 },
  spacer: { width: spacing.m },
  inputBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.m,
  },
  inputText: { ...typography.body, color: colors.text, padding: 0 },

  tabsContainer: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 4, marginBottom: spacing.l },
  tabButton: { flex: 1, paddingVertical: spacing.s, alignItems: 'center', borderRadius: 6 },
  tabButtonActive: { backgroundColor: '#1A2C5B' },
  tabText: { ...typography.bodyMedium, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.white },

  plateInputBox: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden', marginBottom: spacing.xs },
  plateStateCode: { backgroundColor: '#F4F4F4', paddingHorizontal: spacing.m, justifyContent: 'center', borderRightWidth: 1, borderRightColor: colors.border },
  plateStateText: { ...typography.bodyMedium, color: colors.primary, fontWeight: '700' },
  plateTextInput: { flex: 1, padding: spacing.m, ...typography.body, color: colors.text },

  docUploadedItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9',
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: spacing.m, marginBottom: spacing.m,
  },
  docIconBoxSuccess: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#E6F4EA', justifyContent: 'center', alignItems: 'center', marginRight: spacing.m },
  docInfo: { flex: 1 },
  docTitle: { ...typography.bodyMedium, fontWeight: '600', marginBottom: 2 },
  docSubtitleSuccess: { ...typography.caption, color: colors.success },
  replaceText: { ...typography.bodyMedium, color: '#1A2C5B', fontWeight: '700' },

  docPendingItem: {
    backgroundColor: '#F0F4FF', borderWidth: 1, borderColor: '#A6C8FF', borderStyle: 'dashed',
    borderRadius: 8, padding: spacing.m,
  },
  docPendingTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.l },
  docIconBoxPending: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: spacing.m },
  docSubtitle: { ...typography.caption, color: colors.textSecondary },
  actionRequiredBadge: { backgroundColor: '#FFEBEB', paddingHorizontal: spacing.s, paddingVertical: 4, borderRadius: 4 },
  actionRequiredText: { ...typography.caption, color: colors.danger, fontWeight: '700' },
  
  docPendingBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  docSupportedText: { ...typography.caption, color: colors.textSecondary, flex: 1, paddingRight: spacing.s },
  uploadButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2C5B',
    paddingHorizontal: spacing.m, paddingVertical: spacing.s, borderRadius: 8, gap: spacing.xs,
  },
  uploadButtonText: { ...typography.bodyMedium, color: colors.white, fontWeight: '600' },

  infoBox: { flexDirection: 'row', paddingHorizontal: spacing.s, gap: spacing.s, alignItems: 'flex-start' },
  infoBoxText: { flex: 1, ...typography.bodySmall },

  footer: { padding: spacing.l, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  disclaimerText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.m },
});
