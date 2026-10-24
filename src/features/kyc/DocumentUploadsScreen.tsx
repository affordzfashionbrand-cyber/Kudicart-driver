import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { useDriverStore, DocumentsProfile } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';
import { useAuthStore } from '../../store/useAuthStore';
import { styles } from './documentUploads.styles';


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

