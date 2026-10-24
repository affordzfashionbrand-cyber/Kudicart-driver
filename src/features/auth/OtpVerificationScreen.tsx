import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';
import { KudiIcon } from '../../components/KudiIcon';

export const OtpVerificationScreen = ({ navigation, route }: any) => {
  const { phoneNumber } = route.params || {};
  const [otpArray, setOtpArray] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef<Array<TextInput | null>>([]);

  // Formatted phone display without duplicated "+91" prefix
  const formattedPhone = useMemo(() => {
    const raw = (phoneNumber || '').replace(/[^0-9]/g, '');
    const clean = raw.slice(-10);
    return `+91 ${clean}`;
  }, [phoneNumber]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  useEffect(() => {
    // Auto-focus first input box on screen mount
    const timer = setTimeout(() => {
      inputs.current[0]?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    // 1. If cleared
    if (value === '') {
      const newOtp = [...otpArray];
      newOtp[index] = '';
      setOtpArray(newOtp);
      return;
    }

    // 2. Only accept numeric digits
    const clean = value.replace(/[^0-9]/g, '');
    if (!clean) return;

    // 3. Handle pasting of full OTP code (4 to 6 digits)
    if (clean.length >= 4) {
      const digits = clean.slice(0, 6).split('');
      const newOtp = [...otpArray];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtpArray(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      inputs.current[nextFocus]?.focus();
      return;
    }

    // 4. Normal typing / single box editing:
    // If the box already had a digit and user typed a replacement, take the newest character
    const newDigit = clean.slice(-1);
    const newOtp = [...otpArray];
    newOtp[index] = newDigit;
    setOtpArray(newOtp);

    // Auto-advance to next box if not on the 6th box
    if (index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otpArray[index] && index > 0) {
        // Current box was already empty: jump to previous box and clear it
        inputs.current[index - 1]?.focus();
        const newOtp = [...otpArray];
        newOtp[index - 1] = '';
        setOtpArray(newOtp);
      }
    }
  };

  const handleVerify = async () => {
    const code = otpArray.join('');
    if (code.length < 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }

    setIsVerifying(true);
    try {
      await useAuthStore.getState().verifyOtpAsync(phoneNumber, code);
      setIsVerifying(false);
      toast.success('Mobile verification successful.');
    } catch (err: any) {
      setIsVerifying(false);
      toast.error(err?.message || 'Invalid verification OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    if (resendTimer === 0) {
      try {
        setResendTimer(30);
        setOtpArray(['', '', '', '', '', '']);
        const res = await useAuthStore.getState().sendOtpAsync(phoneNumber);
        const code = (res as any)?.mockOtp;
        toast.success(res.message || 'A new OTP has been sent.');
        if (code) {
          toast.info(`Your verification OTP is: ${code}`);
        }
        setTimeout(() => {
          inputs.current[0]?.focus();
        }, 100);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to resend OTP.');
      }
    }
  };

  const fullCode = otpArray.join('');

  return (
    <ScreenContainer>
      {/* Top Header with standard back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <KudiIcon name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>Sent to {formattedPhone}</Text>

            {/* OTP Input Section: Each box can be selected and edited directly */}
            <View style={styles.otpContainer}>
              {otpArray.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputs.current[index] = ref)}
                  style={[
                    styles.inputBox,
                    focusedIndex === index && styles.inputFocused,
                    digit !== '' && styles.inputFilled,
                  ]}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  keyboardType="number-pad"
                  maxLength={index === 0 ? 6 : 2}
                  textAlign="center"
                  selectTextOnFocus={true}
                  // @ts-ignore
                  outlineStyle="none"
                />
              ))}
            </View>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the OTP?{' '}
                {resendTimer > 0 ? (
                  <Text style={styles.resendTimerText}>
                    Resend in {resendTimer}s
                  </Text>
                ) : (
                  <Text style={styles.resendLink} onPress={handleResend}>
                    Resend OTP
                  </Text>
                )}
              </Text>
            </View>

            {fullCode.length === 0 && (
              <View style={styles.autoReadContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.autoReadText}>
                  Waiting for OTP to be detected…
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <PrimaryButton
              title="Verify OTP"
              onPress={handleVerify}
              disabled={fullCode.length !== 6 || isVerifying}
              loading={isVerifying}
              style={styles.verifyButton}
              textStyle={styles.verifyButtonText}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.l,
    justifyContent: 'space-between',
  },
  content: {
    marginTop: spacing.l,
  },
  title: {
    ...typography.h2,
    fontWeight: '700',
    marginBottom: spacing.xs,
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
    marginVertical: spacing.s,
  },
  inputBox: {
    width: 44,
    height: 56,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    backgroundColor: colors.white,
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    padding: 0,
    // @ts-ignore
    outlineStyle: 'none',
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  inputFilled: {
    borderColor: colors.border,
    backgroundColor: colors.white,
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
  verifyButton: {
    height: 56,
    borderRadius: 16,
  },
  verifyButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
