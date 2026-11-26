import React, { useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { useDriverStore, DocumentsProfile } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';
import { useAuthStore } from '../../store/useAuthStore';
import { profileApi } from '../../api';
import { toast } from '../../store/useToastStore';
import { styles } from './documentUploads.styles';

interface DocumentRowProps {
  title: string;
  docType: keyof Omit<DocumentsProfile, 'selfie'>;
  onPress: () => void;
  isReviewMode: boolean;
  isRejected: boolean;
  isUpdated?: boolean;
}

const DocumentRow = ({ title, docType, onPress, isReviewMode, isRejected, isUpdated }: DocumentRowProps) => {
  const { documents } = useDriverStore();
  const doc = documents[docType];
  
  const isPan = docType === 'pan';
  const isComplete = isPan ? Boolean(doc?.front) : Boolean(doc?.front && doc?.back);
  const isIncomplete = isPan ? false : Boolean((doc?.front && !doc?.back) || (!doc?.front && doc?.back));

  const isVerified = isReviewMode && !isRejected && !isUpdated;

  let statusText = 'Not uploaded';
  let statusColor = '#65635F';
  let subtitleText = isPan ? 'Front Side' : 'Front & Back';
  
  if (isRejected) {
    statusText = 'Needs attention';
    statusColor = colors.danger;
    subtitleText = isPan ? 'Front Side · Re-upload' : 'Front & Back · Re-upload';
  } else if (isUpdated) {
    statusText = 'Updated';
    statusColor = '#15803D';
    subtitleText = isPan ? 'Front Side · Updated' : 'Front & Back · Updated';
  } else if (isVerified) {
    statusText = 'Verified';
    statusColor = colors.success;
    subtitleText = isPan ? 'Front Side · Verified' : 'Front & Back · Verified';
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
        <Text style={styles.docTitle} numberOfLines={1}>{title}</Text>
        <Text 
          style={[
            styles.docSubtitle, 
            isRejected && styles.docSubtitleRejected,
            isUpdated && styles.docSubtitleUpdated,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {subtitleText}
        </Text>
      </View>
      <View style={styles.statusContainer}>
        {isRejected ? (
          <KudiIcon name="alert-circle" color={colors.danger} size={15} />
        ) : (isVerified || isComplete || isUpdated) ? (
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
  const { documents, kyc, fetchProfileAsync } = useDriverStore();
  const { kycStatus, rejectionReason: authRejectionReason, setKycStatus } = useAuthStore();
  const isReviewMode = kycStatus === 'REJECTED';

  useFocusEffect(
    useCallback(() => {
      fetchProfileAsync().catch(() => {});
    }, [fetchProfileAsync])
  );

  const combinedRejectionReason = (kyc?.rejectionReason || authRejectionReason || '').trim();

  const isDocRejected = (docType: keyof Omit<DocumentsProfile, 'selfie'>): boolean => {
    if (!isReviewMode) return false;
    const doc = documents[docType];
    // If the driver already re-uploaded this document, it is no longer rejected
    if ((doc as any)?.isReuploaded) return false;
    if ((doc as any)?.status === 'PENDING' && !(doc as any)?.rejectionReason) return false;
    if ((doc as any)?.status === 'VERIFIED') return false;
    if ((doc as any)?.status === 'REJECTED') return true;

    if ((doc as any)?.rejectionReason) return true;

    // Check rejection reason text if status not explicit
    const lower = combinedRejectionReason.toLowerCase();
    if (!lower) return false;

    if (docType === 'drivingLicence') {
      return lower.includes('driving licence') || lower.includes('licence') || lower.includes('license') || lower.includes('dl');
    }
    if (docType === 'vehicleRc') {
      return lower.includes('vehicle rc') || lower.includes('registration certificate') || lower.includes('rc document');
    }
    if (docType === 'aadhaar') {
      return lower.includes('aadhaar');
    }
    if (docType === 'pan') {
      return lower.includes('pan');
    }
    return false;
  };

  const isDocUpdated = (docType: keyof Omit<DocumentsProfile, 'selfie'>): boolean => {
    if (!isReviewMode) return false;
    const doc = documents[docType];
    return Boolean((doc as any)?.isReuploaded || ((doc as any)?.status === 'PENDING' && !(doc as any)?.rejectionReason));
  };

  const docFriendlyNames: Record<string, string> = {
    aadhaar: 'Aadhaar',
    pan: 'PAN',
    drivingLicence: 'Driving Licence',
    vehicleRc: 'Vehicle RC',
  };
  const docTypesList: (keyof Omit<DocumentsProfile, 'selfie'>)[] = ['aadhaar', 'pan', 'drivingLicence', 'vehicleRc'];
  const rejectedDocs = isReviewMode ? docTypesList.filter(isDocRejected) : [];
  const rejectedCount = rejectedDocs.length;
  const flaggedNames = rejectedDocs.map((d) => docFriendlyNames[d] || d).join(' and ');

  const isAllComplete = Boolean(
    documents.aadhaar.front && documents.aadhaar.back &&
    documents.pan.front &&
    documents.drivingLicence.front && documents.drivingLicence.back &&
    documents.vehicleRc.front && documents.vehicleRc.back
  );

  const handleContinue = async () => {
    if (!isAllComplete) return;

    if (isReviewMode) {
      try {
        await profileApi.submitKyc();
        setKycStatus('PENDING');
        toast.success('KYC resubmitted for verification.');
        if (typeof navigation?.replace === 'function') {
          navigation.replace('VerificationPending');
        } else if (typeof navigation?.navigate === 'function') {
          navigation.navigate('VerificationPending');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to submit KYC for verification. Please retry.');
      }
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
                ? rejectedCount === 0
                  ? 'All documents are updated. Please resubmit your application for verification.'
                  : rejectedCount === 1
                  ? 'We could not verify 1 document. Please review and re-upload the flagged document below.'
                  : `We could not verify ${rejectedCount || 'the flagged'} documents. Please review and re-upload the flagged documents below.`
                : 'Please provide clear photos of your documents (front and back where applicable).'}
            </Text>

            {isReviewMode && rejectedCount > 0 && (
              <View style={styles.reviewBanner}>
                <KudiIcon name="alert-circle" color={colors.danger} size={18} />
                <View style={styles.reviewBannerContent}>
                  <Text style={styles.reviewBannerTitle}>Action required</Text>
                  <Text style={styles.reviewBannerText}>
                    Please re-upload {rejectedCount === 1 ? 'a clear photo' : 'clear photos'} for your {flaggedNames}.
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.listContainer}>
              <DocumentRow 
                title="Aadhaar" 
                docType="aadhaar" 
                isReviewMode={isReviewMode}
                isRejected={isDocRejected('aadhaar')}
                isUpdated={isDocUpdated('aadhaar')}
                onPress={() => goToDetail('aadhaar', 'Aadhaar')} 
              />
              <DocumentRow 
                title="PAN" 
                docType="pan" 
                isReviewMode={isReviewMode}
                isRejected={isDocRejected('pan')}
                isUpdated={isDocUpdated('pan')}
                onPress={() => goToDetail('pan', 'PAN')} 
              />
              <DocumentRow 
                title="Driving Licence" 
                docType="drivingLicence" 
                isReviewMode={isReviewMode}
                isRejected={isDocRejected('drivingLicence')}
                isUpdated={isDocUpdated('drivingLicence')}
                onPress={() => goToDetail('drivingLicence', 'Driving Licence')} 
              />
              <DocumentRow 
                title="Vehicle RC" 
                docType="vehicleRc" 
                isReviewMode={isReviewMode}
                isRejected={isDocRejected('vehicleRc')}
                isUpdated={isDocUpdated('vehicleRc')}
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

