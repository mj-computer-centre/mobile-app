import { useColorScheme, useWindowDimensions } from 'react-native';

/**
 * Design tokens. Every colour, size and spacing value in the app comes from here, so the
 * centre's brand colours (still to come from the owner, OPS-07) are a one-file change.
 */
const palette = {
  blue800: '#174C8F',
  blue700: '#1F5FAE',
  blue600: '#2A6FC4',
  blue100: '#E3EEFB',
  blue50: '#F1F6FD',
  blue900: '#0F2E57',
  green700: '#1E7B4C',
  green100: '#E2F4EA',
  red700: '#B42318',
  red100: '#FDE7E5',
  amber700: '#8A5A00',
  amber100: '#FFF3D6',
  grey950: '#0E1116',
  grey900: '#171B22',
  grey850: '#1D222B',
  grey800: '#252B34',
  grey700: '#3A424E',
  grey500: '#6B7380',
  grey300: '#C9CED6',
  grey200: '#E4E8EE',
  grey100: '#F2F4F7',
  grey50: '#F7F8FB',
  white: '#FFFFFF',
};

const light = {
  background: palette.grey50,
  surface: palette.white,
  surfaceMuted: palette.grey100,
  border: palette.grey200,
  text: palette.grey950,
  textMuted: palette.grey500,
  primary: palette.blue700,
  primaryPressed: palette.blue900,
  primarySoft: palette.blue100,
  onPrimary: palette.white,
  /** Large brand areas: the sign-in panel and the Home welcome card. */
  hero: palette.blue800,
  onHero: palette.white,
  onHeroMuted: '#C9DBF4',
  /** Translucent white for shapes and icon tiles on the hero colour. */
  onHeroSubtle: 'rgba(255, 255, 255, 0.12)',
  /** The left navigation on wide screens. */
  sidebar: palette.white,
  sidebarActive: palette.blue50,
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
  hero: '#123A6B',
  onHero: palette.white,
  onHeroMuted: '#AFC6E6',
  onHeroSubtle: 'rgba(255, 255, 255, 0.10)',
  sidebar: palette.grey900,
  sidebarActive: '#16314F',
  success: '#4CC38A',
  successSoft: '#123524',
  danger: '#F97066',
  dangerSoft: '#3D1512',
  warning: '#F5B83D',
  warningSoft: '#3A2A08',
};

export type ThemeColors = typeof light;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 6, md: 10, lg: 16, xl: 20, pill: 999 } as const;

export const typography = {
  display: { fontSize: 30, lineHeight: 38, fontWeight: '800' },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 0.6 },
} as const;

export type TypographyVariant = keyof typeof typography;

/**
 * Soft shadows. `boxShadow` works on Android (New Architecture) and on the web, so cards lift
 * off the page the same way on both.
 */
export const shadows = {
  card: { boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), 0px 1px 3px rgba(16, 24, 40, 0.06)' },
  raised: { boxShadow: '0px 4px 12px rgba(16, 24, 40, 0.08), 0px 2px 4px rgba(16, 24, 40, 0.04)' },
} as const;

/**
 * Background colours for course covers that have no picture yet. Chosen from the title, so a
 * course keeps its colour everywhere it appears.
 */
export const coverTints = ['#1F5FAE', '#0F766E', '#6D28D9', '#B45309', '#BE185D', '#0E7490'];

/** Content never stretches wider than this on the web admin, so forms stay readable. */
export const MAX_CONTENT_WIDTH = 760;
/** Pages made of cards and grids (Home, Courses, Admin) use this on wide screens. */
export const MAX_WIDE_CONTENT_WIDTH = 1120;
/** At this window width and above, the app switches to the desktop layout (sidebar, grids). */
export const WIDE_BREAKPOINT = 900;

export interface Theme {
  colors: ThemeColors;
  dark: boolean;
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { colors: isDark ? dark : light, dark: isDark };
}

/** Phone or desktop layout, from the window width (a resized browser window switches live). */
export function useLayout(): { isWide: boolean; width: number } {
  const { width } = useWindowDimensions();
  return { isWide: width >= WIDE_BREAKPOINT, width };
}
