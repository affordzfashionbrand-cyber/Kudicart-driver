import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/useAuthStore';

export const VerificationPendingScreen = () => {
  const { setKycStatus } = useAuthStore();

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verification Pending</Text>
        <Text style={styles.subtitle}>Your documents are being reviewed by our Fleet Operations team.</Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton title="DEV: Simulate Approval" onPress={() => setKycStatus('APPROVED')} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.l, justifyContent: 'space-between', alignItems: 'center' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { ...typography.h2, marginBottom: spacing.s, textAlign: 'center' },
  subtitle: { ...typography.body, textAlign: 'center' },
  footer: { paddingBottom: spacing.xl, width: '100%' }
});
