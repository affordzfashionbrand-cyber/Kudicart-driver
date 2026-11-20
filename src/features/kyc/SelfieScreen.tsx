import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useDriverStore, DocumentFile } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';
import { useAuthStore } from '../../store/useAuthStore';
import { profileApi } from '../../api';
import { toast } from '../../store/useToastStore';
import { colors } from '../../theme/colors';
import { pickFile } from '../../utils/filePicker';
import { CameraModal } from '../../components/CameraModal';
import { styles } from './selfie.styles';

export const SelfieScreen = ({ navigation }: any) => {
  const { documents, setSelfie } = useDriverStore();
  const { kycStatus, setKycStatus } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const hasSelfie = !!documents.selfie;

  useEffect(() => {
    if (kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW') {
      if (typeof navigation?.replace === 'function') {
        navigation.replace('VerificationPending');
      } else if (typeof navigation?.navigate === 'function') {
        navigation.navigate('VerificationPending');
      }
    }
  }, [kycStatus, navigation]);

  // Handle photo captured from live CameraModal
  const handleCaptureSelfie = async (file: DocumentFile) => {
    try {
      setIsUploading(true);
      await profileApi.uploadDocument({
        docType: 'selfie',
        fileUri: file.uri,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      setSelfie(file);
      toast.show({
        type: 'success',
        message: 'Selfie captured and uploaded successfully.',
      });
    } catch (err: any) {
      toast.show({
        type: 'error',
        message: err?.message || 'Failed to upload selfie to backend.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle uploading selfie from device files / gallery
  const handlePickFileSelfie = async () => {
    try {
      const file = await pickFile();
      if (!file) return;

      setIsUploading(true);
      await profileApi.uploadDocument({
        docType: 'selfie',
        fileUri: file.uri,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      setSelfie(file);
      toast.show({
        type: 'success',
        message: 'Selfie uploaded successfully.',
      });
    } catch (err: any) {
      toast.show({
        type: 'error',
        message: err?.message || 'Failed to upload photo.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setIsCameraOpen(true);
  };

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      const res = await profileApi.submitKyc();
      const updatedStatus = res?.kycStatus || 'UNDER_REVIEW';
      setKycStatus(updatedStatus);
      toast.show({
        type: 'success',
        message: 'KYC documents submitted for verification.',
      });
      if (typeof navigation?.replace === 'function') {
        navigation.replace('VerificationPending');
      } else if (typeof navigation?.navigate === 'function') {
        navigation.navigate('VerificationPending');
      }
    } catch (err: any) {
      const errMsg = String(err?.message || '');
      if (
        errMsg.includes('already') ||
        errMsg.includes('review') ||
        errMsg.includes('PENDING') ||
        errMsg.includes('UNDER_REVIEW')
      ) {
        setKycStatus('UNDER_REVIEW');
        if (typeof navigation?.replace === 'function') {
          navigation.replace('VerificationPending');
        } else if (typeof navigation?.navigate === 'function') {
          navigation.navigate('VerificationPending');
        }
        return;
      }
      toast.show({
        type: 'error',
        message: err?.message || 'Failed to submit KYC documents. Please verify all required documents are uploaded.',
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <Text style={styles.stepText}>PARTNER KYC • STEP 4 OF 4</Text>

            <Text style={styles.title}>Take A Selfie</Text>
            <Text style={styles.subtitle}>
              Take a clear selfie so we can verify your identity and use it as your profile photo.
            </Text>

            <View style={styles.captureSection}>
              {!hasSelfie ? (
                <View style={styles.emptyStateContainer}>
                  <View style={styles.placeholderCircle}>
                    {isUploading ? (
                      <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                      <KudiIcon name="user" color={colors.textSecondary} size={56} />
                    )}
                  </View>
                  <Text style={styles.emptyTitle}>
                    {isUploading ? 'Uploading selfie...' : 'Take a clear selfie'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    Make sure your face is clearly visible, well lit, and looking directly at the camera.
                  </Text>
                  
                  {/* Action Buttons: Camera and Gallery */}
                  <View style={{ width: '100%', maxWidth: 300, gap: 12 }}>
                    <TouchableOpacity
                      style={styles.takeSelfieButton}
                      onPress={() => setIsCameraOpen(true)}
                      disabled={isUploading}
                      activeOpacity={0.8}
                    >
                      <KudiIcon name="camera" color={colors.white} size={20} />
                      <Text style={styles.takeSelfieButtonText}>
                        {isUploading ? 'Uploading...' : 'Take Live Selfie'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.retakeButton,
                        {
                          justifyContent: 'center',
                          paddingVertical: 12,
                          backgroundColor: '#F8FAFC',
                          borderColor: '#CBD5E1',
                        },
                      ]}
                      onPress={handlePickFileSelfie}
                      disabled={isUploading}
                      activeOpacity={0.8}
                    >
                      <KudiIcon name="upload" color={colors.primaryDark} size={18} />
                      <Text style={[styles.retakeText, { color: '#1E293B', fontWeight: '600' }]}>
                        Choose from Files / Gallery
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.capturedStateContainer}>
                  <View style={styles.previewImageContainer}>
                    {documents.selfie?.uri ? (
                      <Image
                        source={{ uri: documents.selfie.uri }}
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <KudiIcon name="user" color={colors.primaryDark} size={64} />
                    )}
                  </View>
                  
                  <View style={styles.statusRow}>
                    <KudiIcon name="check-circle" color={colors.success} size={16} />
                    <Text style={styles.statusText}>Selfie Ready</Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                    <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                      <KudiIcon name="camera" color={colors.primaryDark} size={16} />
                      <Text style={styles.retakeText}>Retake</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.retakeButton, { borderColor: '#CBD5E1' }]}
                      onPress={handlePickFileSelfie}
                    >
                      <KudiIcon name="upload" color={colors.primaryDark} size={16} />
                      <Text style={styles.retakeText}>Change File</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.guidanceSection}>
              <Text style={styles.guidanceItem}>• Face the camera directly</Text>
              <Text style={styles.guidanceItem}>• Keep your full face visible</Text>
              <Text style={styles.guidanceItem}>• Use good lighting</Text>
              <Text style={styles.guidanceItem}>• Avoid anything covering your face</Text>
              
              <View style={styles.noticeBox}>
                <Text style={styles.noticeText}>
                  This photo will be used as your KudiCart profile picture after verification.
                </Text>
              </View>
            </View>

          </View>

          <View style={styles.footer}>
            <PrimaryButton 
              title={isSubmitting ? "Submitting..." : "Continue"} 
              onPress={handleContinue} 
              disabled={!hasSelfie || isSubmitting || isUploading} 
              style={[
                styles.continueButton,
                hasSelfie && !isSubmitting && !isUploading ? styles.continueButtonActive : styles.continueButtonDisabled
              ]}
              textStyle={[
                styles.continueButtonText,
                hasSelfie && !isSubmitting && !isUploading ? styles.continueButtonTextActive : styles.continueButtonTextDisabled
              ]}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Live Camera Modal for Selfie */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCaptureSelfie}
        mode="selfie"
        title="Take Driver Selfie"
      />
    </ScreenContainer>
  );
};



