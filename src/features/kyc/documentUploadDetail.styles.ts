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
  
  content: { marginTop: spacing.xs },
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
    marginBottom: 20,
  },

  // Sides Status Card
  sidesStatusCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 16,
    padding: spacing.m,
    marginBottom: 22,
  },
  sidesStatusTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sidesStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  dotSuccess: {
    backgroundColor: colors.success,
  },
  dotPending: {
    backgroundColor: '#8A8781',
  },
  sidesStatusLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A2C5B',
  },
  sidesStatusValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSuccess: {
    color: colors.success,
  },
  textPending: {
    color: '#65635F',
  },
  sidesStatusDivider: {
    height: 1,
    backgroundColor: '#F3F1EC',
    marginVertical: 8,
  },

  // Upload Section
  uploadSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2C5B',
  },
  requiredStar: {
    color: colors.danger,
  },
  sideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sideBadgeSuccess: {
    backgroundColor: '#E8F5E9',
  },
  sideBadgePending: {
    backgroundColor: '#F3F1EC',
  },
  sideBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sideBadgeTextSuccess: {
    color: colors.success,
  },
  sideBadgeTextPending: {
    color: '#65635F',
  },
  
  // Empty State
  emptyFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 16,
    padding: spacing.m,
  },
  emptyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8F6F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  fileInfo: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2C5B',
    marginBottom: 2,
  },
  uploadHintText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dropZoneError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },

  // Uploading State
  uploadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FFD8C2',
    borderRadius: 16,
    padding: spacing.m,
  },
  uploadingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  uploadingMeta: {
    fontSize: 12,
    color: colors.primaryDark,
  },

  // Selected State
  selectedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 16,
    padding: spacing.m,
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2C5B',
    marginBottom: 2,
  },
  fileMeta: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  iconButton: {
    padding: spacing.xs,
  },

  // Error Row
  errorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    flex: 1,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
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

  issueCard: {
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  issueTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  issueDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
