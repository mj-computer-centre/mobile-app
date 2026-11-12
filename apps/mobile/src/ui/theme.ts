import { useColorScheme } from 'react-native';

/**
 * Design tokens. Every colour, size and spacing value in the app comes from here, so the
 * centre's brand colours (still to come from the owner, OPS-07) are a one-file change.
 */
const palette = {
  blue700: '#1F5FAE',
  blue600: '#2A6FC4',
  blue100: '#E3EEFB',
  blue900: '#0F2E57',
  green700: '#1E7B4C',
  green100: '#E2F4EA',
  red700: '#B42318',
  red100: '#FDE7E5',
  amber700: '#8A5A00',
  amber100: '#FFF3D6',
  grey950: '#0E1116',
  grey900: '#171B22',
  grey800: '#252B34',
  grey700: '#3A424E',
  grey500: '#6B7380',
  grey300: '#C9CED6',
  grey200: '#E2E5EA',
  grey100: '#F2F4F7',
  white: '#FFFFFF',
};

const light = {
  background: palette.grey100,
  surface: palette.white,
  surfaceMuted: palette.grey100,
  border: palette.grey200,
  text: palette.grey950,
  textMuted: palette.grey500,
  primary: palette.blue700,
  primaryPressed: palette.blue900,
  primarySoft: palette.blue100,
  onPrimary: palette.white,
  success: palette.green700,
  successSoft: palette.green100,
  danger: palette.red700,
  dangerSoft: palette.red100,
  warning: palette.amber700,
  warningSoft: palette.amber100,
};

const dark: typeof light = {
  background: palette.grey950,
  surface: palette.grey900,
  surfaceMuted: palette.grey800,
  border: palette.grey700,
  text: palette.grey100,
  textMuted: palette.grey300,
  primary: palette.blue600,
  primaryPressed: palette.blue700,
  primarySoft: '#16314F',
  onPrimary: palette.white,
  success: '#4CC38A',
  successSoft: '#123524',
  danger: '#F97066',
  dangerSoft: '#3D1512',
  warning: '#F5B83D',
  warningSoft: '#3A2A08',
};

export type ThemeColors = typeof light;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 6, md: 10, lg: 16, pill: 999 } as const;

export const typography = {
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Content never stretches wider than this on the web admin, so forms stay readable. */
export const MAX_CONTENT_WIDTH = 760;

export interface Theme {
  colors: ThemeColors;
  dark: boolean;
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { colors: isDark ? dark : light, dark: isDark };
}
