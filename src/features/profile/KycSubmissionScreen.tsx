import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/useAuthStore';

export const KycSubmissionScreen = ({ navigation }: any) => {
  const { setKycStatus } = useAuthStore();

  const handleSubmit = () => {
    setKycStatus('PENDING');
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Submit KYC Documents</Text>
        <Text style={styles.subtitle}>Please upload your driving license and RC.</Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton title="Submit for Verification" onPress={handleSubmit} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.l, justifyContent: 'space-between' },
  content: { flex: 1, marginTop: spacing.xl },
  title: { ...typography.h1, marginBottom: spacing.s },
  subtitle: { ...typography.body, marginBottom: spacing.xl },
  footer: { paddingBottom: spacing.xl }
});
