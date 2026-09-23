import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { KudiIcon } from '../../components/KudiIcon';
import logo from '../../assets/logo.png';

export const VerificationApprovedScreen = ({ navigation }: any) => {
  const handleStartEarning = () => {
    navigation.replace('MainApp');
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <KudiIcon name="check-circle" color={colors.success} size={48} />
        </View>
        
        <Text style={styles.title}>Your Account Is Approved</Text>
        
        <Text style={styles.message}>
          Your documents have been verified successfully. You’re all set to start accepting deliveries and earning with KudiCart.
        </Text>

        <Text style={styles.supportingText}>
          You can now go online and start accepting delivery orders.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton 
          title="Start Earning" 
          onPress={handleStartEarning} 
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
    marginBottom: spacing.l,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    fontWeight: '700',
    color: '#1A2C5B',
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.s,
    lineHeight: 22,
  },
  supportingText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.l,
  },
  footer: {
    padding: spacing.l,
    paddingBottom: spacing.xxl,
  },
});
