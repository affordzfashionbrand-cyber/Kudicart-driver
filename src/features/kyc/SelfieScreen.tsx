import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useDriverStore, DocumentFile } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';
import { useAuthStore } from '../../store/useAuthStore';
import { profileApi } from '../../api';
import { permissionService } from '../../services/permissionService';
import { toast } from '../../store/useToastStore';
import { colors } from '../../theme/colors';
import { styles } from './selfie.styles';

export const SelfieScreen = ({ navigation }: any) => {
  const { documents, setSelfie } = useDriverStore();
  const { setKycStatus } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const hasSelfie = !!documents.selfie;

  const handleTakeSelfie = async () => {
    const status = await permissionService.check('camera');
    if (status !== 'granted') {
      const res = await permissionService.request('camera');
      if (res !== 'granted') {
        toast.show({
          type: 'error',
          message: 'Camera permission is required to capture your driver selfie.',
        });
        return;
      }
    }

    if (Platform.OS === 'web') {
      try {
        setIsCapturing(true);
        const file = await new Promise<DocumentFile | null>((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.setAttribute('capture', 'user');
          input.onchange = (e: any) => {
            const f = e.target.files?.[0];
            if (f) {
              resolve({
                uri: URL.createObjectURL(f),
                name: f.name || 'selfie.jpg',
                size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
                type: f.type || 'image/jpeg',
              });
            } else {
              resolve(null);
            }
          };
          input.style.display = 'none';
          document.body.appendChild(input);
          input.click();
          setTimeout(() => {
            if (document.body.contains(input)) {
              document.body.removeChild(input);
            }
          }, 1000);
        });

        if (!file) {
          setIsCapturing(false);
          return;
        }

        // Upload selfie directly to backend KYC document store
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
        setIsCapturing(false);
      }
    } else {
      // Native device build without third-party camera module (react-native-camera)
      toast.show({
        type: 'warning',
        message: 'Camera capture native module is not yet linked in this device build.',
      });
    }
  };

  const handleRetake = () => {
    setSelfie(null);
  };

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      await profileApi.submitKyc();
      setKycStatus('PENDING');
      toast.show({
        type: 'success',
        message: 'KYC documents submitted for verification.',
      });
    } catch (err: any) {
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
                    <KudiIcon name="user" color={colors.textSecondary} size={56} />
                  </View>
                  <Text style={styles.emptyTitle}>Take a clear selfie</Text>
                  <Text style={styles.emptySubtitle}>Make sure your face is clearly visible and well lit.</Text>
                  <TouchableOpacity style={styles.takeSelfieButton} onPress={handleTakeSelfie}>
                    <KudiIcon name="camera" color={colors.white} size={20} />
                    <Text style={styles.takeSelfieButtonText}>Take Selfie</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.capturedStateContainer}>
                  <View style={styles.previewImageContainer}>
                    <KudiIcon name="user" color={colors.primaryDark} size={64} />
                    {/* In a real app, an Image component would render the selfie URI here */}
                    {/* <Image source={{ uri: documents.selfie?.uri }} style={styles.previewImage} /> */}
                  </View>
                  
                  <View style={styles.statusRow}>
                    <KudiIcon name="check-circle" color={colors.success} size={16} />
                    <Text style={styles.statusText}>Selfie Ready</Text>
                  </View>

                  <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                    <KudiIcon name="refresh-cw" color={colors.primaryDark} size={16} />
                    <Text style={styles.retakeText}>Retake</Text>
                  </TouchableOpacity>
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
              disabled={!hasSelfie || isSubmitting} 
              style={[
                styles.continueButton,
                hasSelfie && !isSubmitting ? styles.continueButtonActive : styles.continueButtonDisabled
              ]}
              textStyle={[
                styles.continueButtonText,
                hasSelfie && !isSubmitting ? styles.continueButtonTextActive : styles.continueButtonTextDisabled
              ]}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};


