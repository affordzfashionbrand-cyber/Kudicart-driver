import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';
import { useAuthStore } from '../../store/useAuthStore';

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
  
  content: { marginTop: spacing.s, flex: 1 },
  stepText: { ...typography.caption, letterSpacing: 1, marginBottom: spacing.s, color: colors.primary, fontWeight: '700' },
  title: { ...typography.h1, fontWeight: '700', color: '#1A2C5B', marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMedium, color: colors.textSecondary, marginBottom: spacing.xl },

  captureSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  
  emptyStateContainer: {
    alignItems: 'center',
    width: '100%',
  },
  placeholderCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    ...typography.h3,
    color: '#1A2C5B',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
    paddingHorizontal: spacing.l,
  },
  takeSelfieButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: 24,
    gap: spacing.s,
  },
  takeSelfieButtonText: {
    ...typography.bodyLarge,
    color: colors.white,
    fontWeight: '700',
  },

  capturedStateContainer: {
    alignItems: 'center',
    width: '100%',
  },
  previewImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.m,
  },
  statusText: {
    ...typography.bodyMedium,
    color: colors.success,
    fontWeight: '700',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  retakeText: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
    fontWeight: '600',
  },

  guidanceSection: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.s,
  },
  guidanceItem: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  noticeBox: {
    marginTop: spacing.m,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  noticeText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },

  footer: { marginTop: spacing.xl, alignItems: 'center', marginBottom: spacing.xl },
});

