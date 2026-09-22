import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';

export const OtpVerificationScreen = ({ route }: any) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');
  const { login } = useAuthStore();

  const handleVerify = () => {
    if (otp.length === 6) {
      // Mock login with token
      login('mock_token_123');
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.stepText}>STEP 2 OF 2</Text>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          Sent to +91 {phoneNumber}
        </Text>

        <TextInput
          style={styles.input}
          value={otp}
          onChangeText={setOtp}
          placeholder="0 0 0 0 0 0"
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton 
          title="Verify & Login →" 
          onPress={handleVerify} 
          disabled={otp.length !== 6} 
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.l,
    justifyContent: 'space-between',
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
  title: {
    ...typography.h1,
    marginBottom: spacing.s,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.l,
    ...typography.h1,
    letterSpacing: 8,
    backgroundColor: colors.surface,
  },
  footer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
});
