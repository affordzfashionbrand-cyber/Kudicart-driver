import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';
import logo from '../../assets/logo.png';

export const PhoneLoginScreen = ({ navigation }: any) => {
  const { initialPhone } = useAuthStore();
  const [phone, setPhone] = useState(initialPhone || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValidPhone = /^[0-9]{10}$/.test(phone);
  const showError = isTouched && !isFocused && phone.length > 0 && !isValidPhone;

  const handlePhoneChange = (text: string) => {
    // Only accept numeric digits, max 10
    const digitsOnly = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(digitsOnly);
  };

  const handleGetOtp = () => {
    if (!isValidPhone) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!isTermsAccepted) {
      toast.warning('Please accept the Terms of Service to continue.');
      return;
    }

    setIsLoading(true);
    // Simulate network request for 1s
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`OTP sent to +91 ${phone}`);
      navigation.navigate('OtpVerification', { phoneNumber: phone });
    }, 1000);
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
            <Text style={styles.title}>Mobile Number</Text>

            <View
              style={[
                styles.inputContainer,
                isFocused && styles.inputFocused,
                showError && styles.inputError,
              ]}
            >
              <View style={styles.prefixContainer}>
                <Text style={styles.prefixText}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  setIsTouched(true);
                }}
              />
            </View>

            {showError && (
              <Text style={styles.validationError}>
                Please enter a valid 10-digit mobile number
              </Text>
            )}

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsTermsAccepted(!isTermsAccepted)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={[styles.checkbox, isTermsAccepted && styles.checkboxChecked]}>
                {isTermsAccepted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>
                I have read and agree to{' '}
                <Text
                  style={styles.linkText}
                  onPress={(e) => {
                    // @ts-ignore
                    if (e && e.stopPropagation) e.stopPropagation();
                    navigation.navigate('Legal');
                  }}
                >
                  Terms and Conditions
                </Text>
                {' '}and{' '}
                <Text
                  style={styles.linkText}
                  onPress={(e) => {
                    // @ts-ignore
                    if (e && e.stopPropagation) e.stopPropagation();
                    navigation.navigate('Legal');
                  }}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <PrimaryButton
              title="Get OTP →"
              onPress={handleGetOtp}
              disabled={!isValidPhone || !isTermsAccepted || isLoading}
              loading={isLoading}
              style={styles.getOtpButton}
              textStyle={styles.getOtpButtonText}
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
  title: {
    ...typography.h2,
    fontWeight: '600',
    marginBottom: spacing.m,
  },
  inputContainer: {
    flexDirection: 'row',
    height: 56,
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
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  prefixContainer: {
    paddingLeft: spacing.l,
    paddingRight: spacing.m,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: colors.border,
    height: 28,
    marginRight: spacing.s,
  },
  prefixText: {
    ...typography.bodyLarge,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    flex: 1,
    height: 56,
    paddingVertical: 0,
    paddingRight: spacing.l,
    fontSize: 17,
    color: colors.text,
    fontWeight: '500',
    letterSpacing: 0.3,
    // @ts-ignore - RN Web outline fix
    outlineStyle: 'none',
  },
  validationError: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.s,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xl,
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  checkboxText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  getOtpButton: {
    height: 56,
    borderRadius: 16,
  },
  getOtpButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
