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
    marginBottom: 24,
  },

  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  reviewBannerContent: {
    flex: 1,
  },
  reviewBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: 2,
  },
  reviewBannerText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  listContainer: {
    gap: 12,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: spacing.l,
  },
  documentRowRejected: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFDFD',
  },
  iconBoxRejected: {
    backgroundColor: '#FFF1F0',
  },
  docSubtitleRejected: {
    color: colors.danger,
    fontWeight: '500',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8F6F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  docInfo: { flex: 1 },
  docTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2C5B',
    marginBottom: 2,
  },
  docSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    letterSpacing: 0.2,
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
