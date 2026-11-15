export const colors = {
  bg: '#0B1020',
  bgTop: '#151C36',
  surface: '#141B2E',
  surfaceRaised: '#1C2440',
  border: '#262F4F',
  text: '#F5F7FF',
  textMuted: '#8A93B2',
  textFaint: '#5B6485',
  sos: '#FF4D4F',
  sosDeep: '#E0263A',
  sosWarm: '#FF7A45',
  sosGlow: 'rgba(255, 77, 79, 0.18)',
  ok: '#3DDC97',
  okSoft: 'rgba(61, 220, 151, 0.14)',
  warn: '#FFB547',
  warnSoft: 'rgba(255, 181, 71, 0.14)',
  danger: '#FF6B6B',
  dangerSoft: 'rgba(255, 107, 107, 0.14)',
  white: '#FFFFFF',
};

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };

export const space = (n: number) => n * 4;

export const type = {
  hero: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.8, color: colors.text },
  title: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.4, color: colors.text },
  body: { fontSize: 16, lineHeight: 23, color: colors.textMuted },
  label: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.textFaint,
  },
};
