import { colors } from './colors';

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.text, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600' as const, color: colors.text, letterSpacing: -0.2 },
  h4: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  bodyLarge: { fontSize: 18, fontWeight: '400' as const, color: colors.text },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.text },
  bodyMedium: { fontSize: 14, fontWeight: '500' as const, color: colors.text },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '500' as const, color: colors.textMuted },
  button: { fontSize: 16, fontWeight: '600' as const, color: colors.white, letterSpacing: 0.2 },
};
