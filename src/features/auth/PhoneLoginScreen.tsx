import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';
import logo from '../../assets/logo.png';

export const PhoneLoginScreen = ({ navigation }: any) => {
  const { initialPhone } = useAuthStore();
  const [phone, setPhone] = useState(initialPhone || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetOtp = () => {
    if (phone.length === 10 && isTermsAccepted) {
      setIsLoading(true);
      // Simulate network request for 1s
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('OtpVerification', { phoneNumber: phone });
      }, 1000);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
          <View style={styles.header}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.portalSubtitle}>Delivery Partner Portal</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.stepText}>STEP 1 OF 2</Text>

            <Text style={styles.title}>Mobile Number</Text>

            <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
              <View style={styles.prefixContainer}>
                <Text style={styles.prefixText}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter Your Number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
            {phone.length > 0 && phone.length < 10 && !isFocused && (
              <Text style={styles.validationError}>
                10-digit number required
              </Text>
            )}

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsTermsAccepted(!isTermsAccepted)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, isTermsAccepted && styles.checkboxChecked]}>
                {isTermsAccepted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>
                I have read and agreed to{' '}
                <Text style={styles.linkText} onPress={() => navigation.navigate('Legal')}>
                  Terms and Conditions
                </Text>
                {' '}and{' '}
                <Text style={styles.linkText} onPress={() => navigation.navigate('Legal')}>
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <PrimaryButton
              title="Get OTP →"
              onPress={handleGetOtp}
              disabled={phone.length !== 10 || !isTermsAccepted || isLoading}
              loading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.l,
  },
  header: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 60,
  },
  portalSubtitle: {
    ...typography.h4,
    color: colors.primaryDark,
    marginTop: spacing.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    marginTop: spacing.xxl,
  },
  stepText: {
    ...typography.caption,
    letterSpacing: 1,
    marginBottom: spacing.s,
    color: colors.textMuted,
  },
  title: {
    ...typography.h2,
    fontWeight: '500',
    marginBottom: spacing.m,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  prefixContainer: {
    paddingLeft: spacing.l,
    paddingRight: spacing.m,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: colors.border,
    height: 24, // Fixed height for a sleek, small line
    marginRight: spacing.s,
  },
  prefixText: {
    ...typography.bodyLarge,
    fontWeight: '500',
    color: colors.text,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.l,
    paddingRight: spacing.l,
    ...typography.bodyLarge,
    fontWeight: '400',
    // @ts-ignore - RN Web outline fix
    outlineStyle: 'none',
  },
  validationError: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.s,
  },
  footer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxText: {
    ...typography.body,
    flex: 1,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  linkText: {
    color: colors.primary,
  },
});
