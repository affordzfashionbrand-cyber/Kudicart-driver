import { StyleSheet } from 'react-native';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
  scrollContainer: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: 8,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  logoContainer: { flex: 1, alignItems: 'center' },
  logo: { width: 140, height: 40 },
  backButtonPlaceholder: { width: 40 },
  
  content: { marginTop: spacing.xs, flex: 1 },
  stepText: {
    ...typography.caption,
    letterSpacing: 0.5,
    marginBottom: 6,
    color: colors.primary,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    fontWeight: '700',
    color: '#1A2C5B',
    marginBottom: 6,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: 24,
  },

  captureSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  
  emptyStateContainer: {
    alignItems: 'center',
    width: '100%',
  },
  placeholderCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    ...typography.h3,
    color: '#1A2C5B',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
    paddingHorizontal: spacing.l,
  },
  takeSelfieButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: 24,
    gap: spacing.s,
  },
  takeSelfieButtonText: {
    ...typography.bodyLarge,
    color: colors.white,
    fontWeight: '700',
  },

  capturedStateContainer: {
    alignItems: 'center',
    width: '100%',
  },
  previewImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.m,
  },
  statusText: {
    ...typography.bodyMedium,
    color: colors.success,
    fontWeight: '700',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  retakeText: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
    fontWeight: '600',
  },

  guidanceSection: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.s,
  },
  guidanceItem: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  noticeBox: {
    marginTop: spacing.m,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  noticeText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },

  footer: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 0,
  },
  continueButton: {
    height: 52,
    borderRadius: 16,
    width: '100%',
  },
  continueButtonDisabled: {
    backgroundColor: '#E2DED7',
  },
  continueButtonActive: {
    backgroundColor: '#FF5A1F',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#65635F',
  },
  continueButtonTextActive: {
    color: '#171716',
  },
});
