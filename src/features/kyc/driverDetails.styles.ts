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
    alignItems: 'center',
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  logo: {
    width: 140,
    height: 40,
  },

  content: {
    marginTop: spacing.xs,
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
  sectionMargin: {
    marginTop: 28,
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
  eyeToggle: {
    paddingRight: spacing.m,
    paddingLeft: spacing.s,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
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

  sectionDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    marginTop: 0,
  },
  radioCard: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  radioCardSelected: {
    backgroundColor: '#FFF0E8',
    borderColor: '#FF5A1F',
    borderWidth: 1.5,
  },
  radioCardUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2DED7',
    borderWidth: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioCircleSelected: {
    borderColor: '#FF5A1F',
  },
  radioCircleUnselected: {
    borderColor: '#8A8781',
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A1F',
  },
  radioLabel: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: '#171716',
  },

  footer: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 0,
  },
});
