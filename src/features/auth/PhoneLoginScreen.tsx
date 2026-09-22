import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import logo from '../../assets/logo.png';

export const PhoneLoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');

  const handleGetOtp = () => {
    if (phone.length === 10) {
      navigation.navigate('OtpVerification', { phoneNumber: phone });
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.stepText}>STEP 1 OF 2</Text>
        <View style={styles.portalBadge}>
          <Text style={styles.portalText}>🚚 DELIVERY PARTNER PORTAL</Text>
        </View>
        
        <Text style={styles.title}>Enter your phone number</Text>
        <Text style={styles.subtitle}>
          We'll send a 6-digit one-time password (OTP) via SMS to verify your fleet partner profile.
        </Text>

        <View style={styles.inputContainer}>
          <View style={styles.prefixContainer}>
            <Text style={styles.prefixText}>🇮🇳 +91</Text>
          </View>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="9876543210"
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
        <Text style={styles.validationText}>
          {phone.length === 10 ? '✅ Valid commercial phone number' : '10 digits required'}
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton 
          title="Get OTP →" 
          onPress={handleGetOtp} 
          disabled={phone.length !== 10} 
        />
        <Text style={styles.termsText}>
          By continuing, you agree to KudiCart's Partner Terms of Service & Privacy Policy
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🛡️ 256-BIT ENCRYPTED FIREBASE AUTH</Text>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.l,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: spacing.xl,
  },
  logo: {
    width: 120,
    height: 40,
  },
  content: {
    flex: 1,
    marginTop: spacing.xxl,
  },
  stepText: {
    ...typography.caption,
    letterSpacing: 1,
    marginBottom: spacing.m,
  },
  portalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAEFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: spacing.l,
  },
  portalText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.s,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  prefixContainer: {
    padding: spacing.m,
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  prefixText: {
    ...typography.h3,
  },
  input: {
    flex: 1,
    padding: spacing.m,
    ...typography.h2,
  },
  validationText: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.s,
  },
  footer: {
    alignItems: 'center',
  },
  termsText: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.l,
    marginBottom: spacing.l,
  },
  badge: {
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
