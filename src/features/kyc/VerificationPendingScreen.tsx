import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { KudiIcon } from '../../components/KudiIcon';
import logo from '../../assets/logo.png';
import { useAuthStore } from '../../store/useAuthStore';
import { useDemoVerificationTimer } from '../../store/demoVerificationState';

export const VerificationPendingScreen = () => {
  const { logout } = useAuthStore();
  
  // TEMPORARY DEMO FLOW: Advances to APPROVED state after 5 seconds
  useDemoVerificationTimer();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <KudiIcon name="clock" color={colors.primary} size={64} />
        </View>
        
        <Text style={styles.title}>Verification Pending</Text>
        
        <Text style={styles.subtitle}>
          Your details and documents have been successfully submitted. Fleet Operations is currently reviewing your profile.
        </Text>

        <View style={styles.infoCard}>
          <KudiIcon name="info-circle" color={colors.textSecondary} size={20} />
          <Text style={styles.infoText}>
            This process typically takes 24-48 hours. You will receive a notification once your account is approved.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton 
          title="Log Out" 
          onPress={logout} 
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontWeight: '700',
    color: '#1A2C5B',
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.m,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: spacing.l,
    borderRadius: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginLeft: spacing.m,
    flex: 1,
  },
  footer: {
    padding: spacing.l,
    paddingBottom: spacing.xxl,
  },
});
