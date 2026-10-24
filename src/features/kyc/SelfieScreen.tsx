import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useDriverStore } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';
import { useAuthStore } from '../../store/useAuthStore';
import { styles } from './selfie.styles';

export const SelfieScreen = ({ navigation }: any) => {
  const { documents, setSelfie } = useDriverStore();
  const { setKycStatus } = useAuthStore();
  
  const hasSelfie = !!documents.selfie;

  const handleTakeSelfie = () => {
    // Simulated selfie capture mechanism (demo compatible)
    setSelfie({
      uri: 'file:///simulated/selfie.jpg',
      name: 'selfie.jpg',
      size: '1.4 MB',
      type: 'image/jpeg'
    });
  };

  const handleRetake = () => {
    setSelfie(null);
  };

  const handleContinue = () => {
    // Continue to next step in KYC workflow
    setKycStatus('PENDING');
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
              title="Continue" 
              onPress={handleContinue} 
              disabled={!hasSelfie} 
              style={[
                styles.continueButton,
                hasSelfie ? styles.continueButtonActive : styles.continueButtonDisabled
              ]}
              textStyle={[
                styles.continueButtonText,
                hasSelfie ? styles.continueButtonTextActive : styles.continueButtonTextDisabled
              ]}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};


