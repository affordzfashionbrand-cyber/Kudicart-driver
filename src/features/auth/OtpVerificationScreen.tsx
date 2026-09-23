import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';

export const OtpVerificationScreen = ({ route }: any) => {
  const { phoneNumber } = route.params;
  const { login, initialOtp } = useAuthStore();
  
  const [otpArray, setOtpArray] = useState(
    initialOtp ? initialOtp.split('') : ['', '', '', '', '', '']
  );
  
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => {
      inputs.current[0]?.focus();
    }, 100);
  }, []);

  const handleVerify = () => {
    const code = otpArray.join('');
    if (code.length === 6) {
      setIsVerifying(true);
      // Simulate network request for 1.5s
      setTimeout(() => {
        setIsVerifying(false);
        login('mock_token_123', route.params.phoneNumber);
      }, 1500);
    }
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      setResendTimer(30);
      // Actual resend logic would go here
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    // Handle pasting a string of numbers
    if (value.length > 1) {
      const pasted = value.replace(/[^0-9]/g, '').slice(0, 6).split('');
      const newOtp = [...otpArray];
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtpArray(newOtp);
      const nextFocus = Math.min(pasted.length, 5);
      inputs.current[nextFocus]?.focus();
      return;
    }

    // Handle single character input
    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);

    // Auto advance
    if (value !== '' && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace when empty
    if (e.nativeEvent.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newOtp = [...otpArray];
      newOtp[index - 1] = '';
      setOtpArray(newOtp);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
          <View style={styles.content}>
            <Text style={styles.stepText}>STEP 2 OF 2</Text>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>
              Sent to +91 {phoneNumber}
            </Text>

            <View style={styles.otpContainer}>
              {otpArray.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputs.current[index] = ref)}
                  style={[
                    styles.inputBox,
                    focusedIndex === index && styles.inputFocused
                  ]}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  keyboardType="number-pad"
                  maxLength={6} // Allow pasting
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the OTP?{' '}
                {resendTimer > 0 ? (
                  <Text style={styles.resendTimerText}>Resend in {resendTimer}s</Text>
                ) : (
                  <Text style={styles.resendLink} onPress={handleResend}>
                    Resend OTP
                  </Text>
                )}
              </Text>
            </View>

            {otpArray.join('').length === 0 && (
              <View style={styles.autoReadContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.autoReadText}>Waiting for OTP to be detected…</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <PrimaryButton 
              title="Verify OTP" 
              onPress={handleVerify} 
              disabled={otpArray.join('').length !== 6 || isVerifying} 
              loading={isVerifying}
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
    marginBottom: spacing.s,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  inputBox: {
    width: 44, // Reduced from 48 to prevent overflow on 320px screens
    height: 56,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    backgroundColor: colors.white,
    ...typography.h2,
    fontWeight: '400',
    textAlign: 'center',
    padding: 0, // fixes web offset
    // @ts-ignore
    outlineStyle: 'none',
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  autoReadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  autoReadText: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginLeft: spacing.s,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing.l,
  },
  resendText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  resendTimerText: {
    ...typography.body,
    color: colors.textMuted,
  },
  resendLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
});
