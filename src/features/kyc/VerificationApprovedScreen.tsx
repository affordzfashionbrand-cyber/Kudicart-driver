import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { KudiIcon } from '../../components/KudiIcon';
import logo from '../../assets/logo.png';
import { useAuthStore } from '../../store/useAuthStore';
import { useDriverStore } from '../../store/useDriverStore';

export const VerificationApprovedScreen = ({ navigation }: any) => {
  const { logout } = useAuthStore();
  const { updateProfile } = useDriverStore();

  const handleStartEarning = () => {
    // Preserve active approved status and take partner into approved Home dashboard
    updateProfile({ status: 'Active' });
    navigation.replace('MainApp');
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header with safe-area padding to prevent clipping */}
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.content}>
          {/* Success Checkmark Illustration */}
          <View style={styles.iconContainer}>
            <KudiIcon name="check-circle" color={colors.success} size={48} />
          </View>
          
          {/* Verification Heading in sentence case */}
          <Text style={styles.title}>Your account is approved</Text>
          
          {/* Concise single supporting message */}
          <Text style={styles.message}>
            Your documents have been verified. You're ready to start delivering with KudiCart.
          </Text>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <PrimaryButton 
            title="Start earning" 
            onPress={handleStartEarning} 
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
          />
          <TouchableOpacity
            onPress={logout}
            style={styles.logoutBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
          >
            <Text style={styles.logoutBtnText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.l,
    paddingTop: Platform.OS === 'web' ? 24 : 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 16,
  },
  logo: {
    width: 140,
    height: 38,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.m,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2C5B',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
    paddingBottom: 16,
  },
  actionButton: {
    height: 52,
    borderRadius: 16,
    width: '100%',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.l,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
