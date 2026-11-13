import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { KudiIcon } from '../../components/KudiIcon';
import logo from '../../assets/logo.png';
import { useAuthStore } from '../../store/useAuthStore';

export const VerificationRejectedScreen = ({ navigation }: any) => {
  const { logout, rejectionReason, syncStatusAsync } = useAuthStore();

  React.useEffect(() => {
    syncStatusAsync?.();
  }, [syncStatusAsync]);

  const handleReview = () => {
    // Route partner directly to document uploads or driver details screen identifying failed documents
    navigation.navigate('DocumentUploads');
  };

  const parsedIssues = React.useMemo(() => {
    if (!rejectionReason) return [];
    return rejectionReason
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^[•\-\*]\s*/, ''));
  }, [rejectionReason]);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header with safe-area padding to prevent clipping */}
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.content}>
          {/* Red outlined warning icon */}
          <View style={styles.iconContainer}>
            <KudiIcon name="alert-circle" color={colors.danger} size={52} />
          </View>
          
          {/* Verification Heading in sentence case */}
          <Text style={styles.title}>Verification needs attention</Text>
          
          {/* Simplified supporting copy */}
          <Text style={styles.message}>
            We couldn't verify some of your details or documents. Review the information below and resubmit it for verification.
          </Text>

          {/* Dynamic Rejection Feedback Card */}
          {parsedIssues.length > 0 ? (
            <View style={styles.issuesCard}>
              <View style={styles.issuesHeader}>
                <KudiIcon name="alert-circle" color={colors.danger} size={18} />
                <Text style={styles.issuesTitle}>Items Requiring Attention</Text>
              </View>
              <View style={styles.issuesList}>
                {parsedIssues.map((issue, idx) => (
                  <View key={idx} style={styles.issueItem}>
                    <Text style={styles.issueBullet}>•</Text>
                    <Text style={styles.issueText}>{issue}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.secondaryWarning}>
              Your account will remain unavailable until verification is complete.
            </Text>
          )}
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <PrimaryButton 
            title="Review and resubmit" 
            onPress={handleReview}
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
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  secondaryWarning: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.s,
  },
  issuesCard: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  issuesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
    paddingBottom: 8,
  },
  issuesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  issuesList: {
    gap: 6,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  issueBullet: {
    fontSize: 13,
    color: colors.danger,
    lineHeight: 18,
  },
  issueText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#991B1B',
    fontWeight: '500',
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
