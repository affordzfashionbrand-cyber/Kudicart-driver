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
  docType: keyof Omit<DocumentsProfile, 'selfie'>;
  onPress: () => void;
  isReviewMode: boolean;
}

const DocumentRow = ({ title, docType, onPress, isReviewMode }: DocumentRowProps) => {
  const { documents } = useDriverStore();
  const doc = documents[docType];
  
  const isComplete = Boolean(doc?.front && doc?.back);
  const isIncomplete = Boolean((doc?.front && !doc?.back) || (!doc?.front && doc?.back));

  // Highlighting specific verification issues for review mode
  const isRejected = isReviewMode && (docType === 'drivingLicence' || docType === 'vehicleRc');
  const isVerified = isReviewMode && (docType === 'aadhaar' || docType === 'pan');

  let statusText = 'Not uploaded';
  let statusColor = '#65635F';
  let subtitleText = 'Front & Back';
  
  if (isRejected) {
    statusText = 'Needs attention';
    statusColor = colors.danger;
    subtitleText = docType === 'drivingLicence'
      ? 'Photo blurry or cropped · Re-upload'
      : 'Registration mismatch · Re-upload';
  } else if (isVerified) {
    statusText = 'Verified';
    statusColor = colors.success;
    subtitleText = 'Front & Back · Verified';
  } else if (isComplete) {
    statusText = 'Uploaded';
    statusColor = colors.success;
  } else if (isIncomplete) {
    statusText = 'Incomplete';
    statusColor = '#B45309';
  }

  return (
    <TouchableOpacity
      style={[styles.documentRow, isRejected && styles.documentRowRejected]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={[styles.iconBox, isRejected && styles.iconBoxRejected]}>
        <KudiIcon 
          name={isRejected ? 'alert-circle' : 'document'} 
          color={isRejected ? colors.danger : (isComplete ? colors.primary : '#1A2C5B')} 
          size={22} 
        />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docTitle}>{title}</Text>
        <Text style={[styles.docSubtitle, isRejected && styles.docSubtitleRejected]}>
          {subtitleText}
        </Text>
      </View>
      <View style={styles.statusContainer}>
        {isRejected ? (
          <KudiIcon name="alert-circle" color={colors.danger} size={15} />
        ) : (isVerified || isComplete) ? (
          <KudiIcon name="check-circle" color={colors.success} size={15} />
        ) : null}
        <Text style={[styles.statusText, { color: statusColor, fontWeight: '600' }]}>
          {statusText}
        </Text>
        <KudiIcon name="chevron-right" color={isRejected ? colors.danger : '#8A8781'} size={18} />
      </View>
    </TouchableOpacity>
  );
};

export const DocumentUploadsScreen = ({ navigation }: any) => {
  const { documents } = useDriverStore();
  const { kycStatus, setKycStatus } = useAuthStore();
  const isReviewMode = kycStatus === 'REJECTED';

  const isAllComplete = Boolean(
    documents.aadhaar.front && documents.aadhaar.back &&
    documents.pan.front && documents.pan.back &&
    documents.drivingLicence.front && documents.drivingLicence.back &&
    documents.vehicleRc.front && documents.vehicleRc.back
  );

  const handleContinue = () => {
    if (!isAllComplete) return;

    if (isReviewMode) {
      // Re-submitted: transition back to pending verification
      setKycStatus('PENDING');
    } else {
      navigation.navigate('Selfie');
    }
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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <KudiIcon name="arrow-left" color={colors.primary} size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>
            <View style={styles.backButtonPlaceholder} />
          </View>

          <View style={styles.content}>
            <Text style={styles.stepText}>
              {isReviewMode ? 'VERIFICATION REVIEW · ACTION REQUIRED' : 'PARTNER KYC · STEP 3 OF 4'}
            </Text>

            <Text style={styles.title}>
              {isReviewMode ? 'Review Documents' : 'Document Uploads'}
            </Text>
            <Text style={styles.subtitle}>
              {isReviewMode
                ? 'We could not verify 2 documents. Please review and re-upload the flagged documents below.'
                : 'Please provide clear photos of the front and back of the following documents.'}
            </Text>

            {isReviewMode && (
              <View style={styles.reviewBanner}>
                <KudiIcon name="alert-circle" color={colors.danger} size={18} />
                <View style={styles.reviewBannerContent}>
                  <Text style={styles.reviewBannerTitle}>Action required</Text>
                  <Text style={styles.reviewBannerText}>
                    Please re-upload clear photos for your Driving Licence and Vehicle RC.
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.listContainer}>
              <DocumentRow 
                title="Aadhaar" 
                docType="aadhaar" 
                isReviewMode={isReviewMode}
                onPress={() => goToDetail('aadhaar', 'Aadhaar')} 
              />
              <DocumentRow 
                title="PAN" 
                docType="pan" 
                isReviewMode={isReviewMode}
                onPress={() => goToDetail('pan', 'PAN')} 
              />
              <DocumentRow 
                title="Driving Licence" 
                docType="drivingLicence" 
                isReviewMode={isReviewMode}
                onPress={() => goToDetail('drivingLicence', 'Driving Licence')} 
              />
              <DocumentRow 
                title="Vehicle RC" 
                docType="vehicleRc" 
                isReviewMode={isReviewMode}
                onPress={() => goToDetail('vehicleRc', 'Vehicle RC')} 
              />
            </View>

          </View>

          <View style={styles.footer}>
            <PrimaryButton 
              title={isReviewMode ? 'Resubmit for verification' : 'Continue'} 
              onPress={handleContinue} 
              disabled={!isAllComplete} 
              style={[
                styles.continueButton,
                isAllComplete ? styles.continueButtonActive : styles.continueButtonDisabled
              ]}
              textStyle={[
                styles.continueButtonText,
                isAllComplete ? styles.continueButtonTextActive : styles.continueButtonTextDisabled
              ]}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
  scrollContainer: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: 8,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  logoContainer: { flex: 1, alignItems: 'center' },
  logo: { width: 140, height: 40 },
  backButtonPlaceholder: { width: 40 },
  
  content: { marginTop: spacing.xs },
  stepText: {
    ...typography.caption,
    letterSpacing: 0.5,
    marginBottom: 6,
    color: colors.primary,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    fontWeight: '700',
    color: '#1A2C5B',
    marginBottom: 6,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: 24,
  },

  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  reviewBannerContent: {
    flex: 1,
  },
  reviewBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: 2,
  },
  reviewBannerText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  listContainer: {
    gap: 12,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: spacing.l,
  },
  documentRowRejected: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFDFD',
  },
  iconBoxRejected: {
    backgroundColor: '#FFF1F0',
  },
  docSubtitleRejected: {
    color: colors.danger,
    fontWeight: '500',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8F6F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  docInfo: { flex: 1 },
  docTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2C5B',
    marginBottom: 2,
  },
  docSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  
  footer: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 0,
  },
  continueButton: {
    height: 52,
    borderRadius: 16,
    width: '100%',
  },
  continueButtonDisabled: {
    backgroundColor: '#E2DED7',
  },
  continueButtonActive: {
    backgroundColor: '#FF5A1F',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#65635F',
  },
  continueButtonTextActive: {
    color: '#171716',
  },
});
