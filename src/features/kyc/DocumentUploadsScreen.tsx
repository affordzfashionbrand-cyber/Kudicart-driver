import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore, DocumentsProfile } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';
import { useAuthStore } from '../../store/useAuthStore';


interface DocumentRowProps {
  title: string;
  docType: keyof DocumentsProfile;
  onPress: () => void;
}

const DocumentRow = ({ title, docType, onPress }: DocumentRowProps) => {
  const { documents } = useDriverStore();
  const doc = documents[docType];
  
  const isComplete = doc.front && doc.back;
  const isIncomplete = (doc.front && !doc.back) || (!doc.front && doc.back);
  const isNotUploaded = !doc.front && !doc.back;

  let statusText = 'NOT UPLOADED';
  let statusColor = colors.textMuted;
  
  if (isComplete) {
    statusText = 'COMPLETE';
    statusColor = colors.success;
  } else if (isIncomplete) {
    statusText = 'INCOMPLETE';
    statusColor = colors.warning;
  }

  return (
    <TouchableOpacity style={styles.documentRow} onPress={onPress}>
      <View style={styles.iconBox}>
        <KudiIcon name="document" color={colors.textSecondary} size={24} />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docTitle}>{title}</Text>
        <Text style={styles.docSubtitle}>Front & Back</Text>
      </View>
      <View style={styles.statusContainer}>
        {isComplete && <KudiIcon name="check-circle" color={colors.success} size={16} />}
        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        <KudiIcon name="chevron-right" color={colors.textMuted} size={20} />
      </View>
    </TouchableOpacity>
  );
};

export const DocumentUploadsScreen = ({ navigation }: any) => {
  const { documents } = useDriverStore();

  const { setKycStatus } = useAuthStore();

  const isAllComplete = 
    (documents.aadhaar.front && documents.aadhaar.back) &&
    (documents.pan.front && documents.pan.back) &&
    (documents.drivingLicence.front && documents.drivingLicence.back) &&
    (documents.vehicleRc.front && documents.vehicleRc.back);

  const handleContinue = () => {
    setKycStatus('PENDING');
  };

  const goToDetail = (docType: keyof DocumentsProfile, title: string) => {
    navigation.navigate('DocumentUploadDetail', { docType, title });
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <KudiIcon name="arrow-left" color={colors.primary} size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>
            <View style={styles.backButtonPlaceholder} />
          </View>

          <View style={styles.content}>
            <Text style={styles.stepText}>PARTNER KYC • STEP 3 OF 3</Text>

            <Text style={styles.title}>Document Uploads</Text>
            <Text style={styles.subtitle}>
              Please provide clear photos of the front and back of the following documents.
            </Text>

            <View style={styles.listContainer}>
              <DocumentRow 
                title="Aadhaar" 
                docType="aadhaar" 
                onPress={() => goToDetail('aadhaar', 'Aadhaar')} 
              />
              <DocumentRow 
                title="PAN" 
                docType="pan" 
                onPress={() => goToDetail('pan', 'PAN')} 
              />
              <DocumentRow 
                title="Driving Licence" 
                docType="drivingLicence" 
                onPress={() => goToDetail('drivingLicence', 'Driving Licence')} 
              />
              <DocumentRow 
                title="Vehicle RC" 
                docType="vehicleRc" 
                onPress={() => goToDetail('vehicleRc', 'Vehicle RC')} 
              />
            </View>

          </View>

          <View style={styles.footer}>
            <PrimaryButton 
              title="Continue" 
              onPress={handleContinue} 
              disabled={!isAllComplete} 
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: spacing.l },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  logoContainer: { flex: 1, alignItems: 'center' },
  logo: { width: 140, height: 40 },
  backButtonPlaceholder: { width: 40 },
  
  content: { marginTop: spacing.s },
  stepText: { ...typography.caption, letterSpacing: 1, marginBottom: spacing.s, color: colors.primary, fontWeight: '700' },
  title: { ...typography.h1, fontWeight: '700', color: '#1A2C5B', marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMedium, color: colors.textSecondary, marginBottom: spacing.xl },

  listContainer: {
    gap: spacing.m,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: spacing.l,
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  docInfo: { flex: 1 },
  docTitle: { ...typography.bodyLarge, fontWeight: '600', color: '#1A2C5B', marginBottom: 2 },
  docSubtitle: { ...typography.caption, color: colors.textSecondary },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statusText: { ...typography.caption, fontWeight: '700' },
  
  footer: { marginTop: spacing.xxl, alignItems: 'center', marginBottom: spacing.xl },
});
