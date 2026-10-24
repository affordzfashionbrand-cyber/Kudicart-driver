export const tokens = {
  colors: {
    light: {
      brandWhite: '#F7F7F5',
      surface: '#FFFFFF',
      ink: '#111111',
      graphite: '#333333',
      muted: '#6B6B67',
      concrete: '#D9D0C9',
      border: '#E4E0DB',
      signalOrange: '#FF5A1F',
      success: '#20885A',
      successSoft: '#E8F4ED',
      warning: '#C9822E',
      error: '#C7433D',
      // keep basic fallback if needed
      canvas: '#F7F7F5',
      line: '#E4E0DB',
      online: '#20885A',
      offline: '#6B6B67',
      ink900: '#111111',
      ink500: '#6B6B67',
      ink300: '#A8A8A8',
      primary: '#FF5A1F',
    },
    dark: { // We'll map dark to same for now to ensure consistency as per "Global Home Screen System"
      brandWhite: '#F7F7F5',
      surface: '#FFFFFF',
      ink: '#111111',
      graphite: '#333333',
      muted: '#6B6B67',
      concrete: '#D9D0C9',
      border: '#E4E0DB',
      signalOrange: '#FF5A1F',
      success: '#20885A',
      successSoft: '#E8F4ED',
      warning: '#C9822E',
      error: '#C7433D',
      canvas: '#F7F7F5',
      line: '#E4E0DB',
      online: '#20885A',
      offline: '#6B6B67',
      ink900: '#111111',
      ink500: '#6B6B67',
      ink300: '#A8A8A8',
      primary: '#FF5A1F',
    }
  },
  typography: {
    hero: { fontFamily: 'Sohne', fontSize: 32, lineHeight: 40, fontWeight: '700' as const }, // Söhne
    title: { fontFamily: 'Sohne', fontSize: 16, lineHeight: 22, fontWeight: '600' as const }, // Söhne
    h3: { fontFamily: 'Sohne', fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
    section: { fontFamily: 'Sohne', fontSize: 15, lineHeight: 20, fontWeight: '600' as const }, // Söhne
    body: { fontFamily: 'Inter', fontSize: 13, lineHeight: 18, fontWeight: '400' as const }, // Inter
    caption: { fontFamily: 'Inter', fontSize: 12, lineHeight: 16, fontWeight: '500' as const }, // Inter
    minimum: { fontFamily: 'Inter', fontSize: 11, lineHeight: 14, fontWeight: '400' as const }, // Inter
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
    xhuge: 48,
    gutter: 16, // using l
    cardGap: 16, // using l
    cardPadding: 18,
  },
  radii: {
    largeCard: 16,
    card: 12,
    button: 10,
    pill: 999,
  }
};
