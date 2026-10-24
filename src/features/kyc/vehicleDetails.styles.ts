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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 40,
  },
  backButtonPlaceholder: {
    width: 40,
  },

  content: {
    marginTop: spacing.xs,
    position: 'relative',
  },
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

  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  fieldMargin: {
    marginTop: 22,
  },
  required: { color: colors.danger },

  inputContainer: {
    flexDirection: 'row',
    height: 48,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    height: 48,
    paddingVertical: 0,
    paddingHorizontal: spacing.m,
    ...typography.bodyLarge,
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    // @ts-ignore
    outlineStyle: 'none',
  },

  dropdownContainer: {
    height: 48,
    paddingHorizontal: spacing.m,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: colors.textMuted,
  },

  typeDropdownWrapper: {
    position: 'relative',
    zIndex: 100,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: -600,
    bottom: -600,
    left: -200,
    right: -200,
    zIndex: 999,
  },
  typeDropdownList: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    backgroundColor: colors.white,
    overflow: 'hidden',
    zIndex: 1000,
    shadowColor: '#1A2C5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  typeDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F2EE',
  },
  typeDropdownItemActive: {
    backgroundColor: '#FFF0E8',
  },
  typeDropdownItemText: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
  },
  typeDropdownItemTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  validationError: {
    ...typography.caption,
    fontSize: 12,
    color: colors.danger,
    marginTop: 5,
  },

  rowInputs: {
    flexDirection: 'row',
    marginTop: 22,
    alignItems: 'flex-start',
  },
  flexHalf: { flex: 1 },
  spacer: { width: spacing.m },

  footer: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 0,
  },
});
