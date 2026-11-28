import { useColorScheme, useWindowDimensions, type TextStyle } from 'react-native';

/**
 * Design tokens. Every colour, size and spacing value in the app comes from here
 * (docs/architecture/design-system.md).
 *
 * The idea behind the look: students come to the centre to learn the keyboard, so the things
 * you press are keys. A key has a face and an edge below it, and it goes down when pressed.
 * Ink blue is the page, cobalt is what can be chosen, and marigold is the Enter key: the one
 * action a screen most wants you to take.
 */
const palette = {
  ink950: '#0B0E2A',
  ink900: '#121640',
  ink800: '#1A2060',
  ink700: '#262D7A',
  cobalt700: '#2337B8',
  cobalt600: '#2F45E3',
  cobalt300: '#8E9BFF',
  cobalt200: '#A9B3FF',
  cobalt100: '#E3E7FF',
  cobalt50: '#F1F3FF',
  marigold700: '#B87A00',
  marigold600: '#D08A00',
  marigold500: '#FFB61F',
  marigold400: '#FFC233',
  marigold100: '#FFF0C7',
  leaf700: '#157A44',
  leaf400: '#4FD08C',
  leaf100: '#DDF5E7',
  sindoor700: '#C2331F',
  sindoor400: '#FF8473',
  sindoor100: '#FDE4DF',
  amber800: '#7A4E00',
  slate900: '#11142D',
  slate600: '#565C80',
  slate400: '#8A90B2',
  slate300: '#C4C8E2',
  slate200: '#DCDFF0',
  slate100: '#ECEEF8',
  paper: '#F3F4FB',
  white: '#FFFFFF',
};

const light = {
  background: palette.paper,
  surface: palette.white,
  /** Fields, pressed rows and quiet tiles. */
  surfaceMuted: palette.slate100,
  border: palette.slate200,
  text: palette.slate900,
  textMuted: palette.slate600,
  /** Placeholders and disabled text only: too light for anything that must be read. */
  textFaint: palette.slate400,

  /** What can be chosen: links, selected tabs, standard buttons. */
  primary: palette.cobalt600,
  primaryEdge: palette.cobalt700,
  primarySoft: palette.cobalt100,
  onPrimary: palette.white,

  /** The Enter key. One per screen. */
  accent: palette.marigold500,
  accentEdge: palette.marigold600,
  accentSoft: palette.marigold100,
  onAccent: palette.ink900,

  /** A plain key: the face is a surface, the edge a shade darker. */
  key: palette.white,
  keyEdge: palette.slate300,

  /** Large brand areas: the website's top section, the sign-in panel, the next-test ticket. */
  hero: palette.ink900,
  heroRaised: palette.ink700,
  heroEdge: palette.ink950,
  onHero: palette.white,
  onHeroMuted: '#B9C0EE',
  onHeroSubtle: 'rgba(255, 255, 255, 0.10)',

  sidebar: palette.white,
  sidebarActive: palette.cobalt50,

  success: palette.leaf700,
  successEdge: '#0F5C33',
  successSoft: palette.leaf100,
  danger: palette.sindoor700,
  dangerEdge: '#96271A',
  dangerSoft: palette.sindoor100,
  warning: palette.amber800,
  warningSoft: palette.marigold100,
  /** Behind sheets and dialogs. */
  scrim: 'rgba(11, 14, 42, 0.55)',
};

const dark: typeof light = {
  background: palette.ink950,
  surface: '#141A45',
  surfaceMuted: '#1C2358',
  border: '#2A3272',
  text: '#EEF0FF',
  textMuted: '#A9B0DC',
  textFaint: '#7C84B8',

  primary: palette.cobalt300,
  primaryEdge: '#5F6ED6',
  primarySoft: '#232B6B',
  onPrimary: palette.ink950,

  accent: palette.marigold400,
  accentEdge: palette.marigold700,
  accentSoft: '#3D2F0A',
  onAccent: palette.ink900,

  key: '#1C2358',
  keyEdge: '#080B24',

  hero: palette.ink800,
  heroRaised: palette.ink700,
  heroEdge: '#070A22',
  onHero: palette.white,
  onHeroMuted: '#B9C0EE',
  onHeroSubtle: 'rgba(255, 255, 255, 0.10)',

  sidebar: '#10153B',
  sidebarActive: '#232B6B',

  success: palette.leaf400,
  successEdge: '#2A9A62',
  successSoft: '#103825',
  danger: palette.sindoor400,
  dangerEdge: '#C4594A',
  dangerSoft: '#42160F',
  warning: palette.marigold400,
  warningSoft: '#3D2F0A',
  scrim: 'rgba(3, 4, 14, 0.7)',
};

export type ThemeColors = typeof light;
export type ColorName = keyof ThemeColors;

/** Distinct steps so closeness carries meaning: rows sit closer than groups, groups than sections. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 72,
} as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

/**
 * Anek Latin, by Ek Type of Mumbai, carries everything the app itself says: headings, buttons,
 * tabs, numbers and key legends. Each weight is its own family (loaded in app-shell/fonts.ts),
 * so styles choose a family and never set fontWeight, which would fake a bolder cut on Android.
 * What people read and write (lesson titles, names, notes) stays in the phone's own font, which
 * also covers Hindi.
 */
export const fonts = {
  display: 'AnekLatin_800ExtraBold',
  heading: 'AnekLatin_700Bold',
  label: 'AnekLatin_600SemiBold',
} as const;

export const typography = {
  /** The website's main headline on a laptop. */
  hero: { fontFamily: fonts.display, fontSize: 52, lineHeight: 56, letterSpacing: -1 },
  display: { fontFamily: fonts.display, fontSize: 32, lineHeight: 37, letterSpacing: -0.4 },
  title: { fontFamily: fonts.heading, fontSize: 25, lineHeight: 30, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.heading, fontSize: 19, lineHeight: 24 },
  subheading: { fontFamily: fonts.label, fontSize: 17, lineHeight: 22 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  /** Buttons, tabs, form labels. */
  label: { fontFamily: fonts.label, fontSize: 15, lineHeight: 20 },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  /** Badges and the smallest chrome. */
  tag: { fontFamily: fonts.label, fontSize: 12.5, lineHeight: 16, letterSpacing: 0.1 },
  /** Scores, timers and counts. Digits keep one width so a running clock does not shake. */
  numeral: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 44,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/**
 * Two levels are enough. `boxShadow` works on Android (New Architecture) and on the web, so
 * surfaces lift the same way on both. Dark surfaces use their border instead.
 */
export const shadows = {
  card: { boxShadow: '0px 1px 2px rgba(18, 22, 64, 0.06)' },
  raised: { boxShadow: '0px 10px 30px rgba(18, 22, 64, 0.14), 0px 2px 6px rgba(18, 22, 64, 0.06)' },
} as const;

/** How far a key travels when pressed, by size. */
export const keyDepth = { sm: 3, md: 4, lg: 6 } as const;

/**
 * Colours for course keys that have no picture yet: face and edge. Chosen from the title, so a
 * course keeps its colour everywhere it appears. All carry white legends.
 */
export const coverTints: readonly { face: string; edge: string }[] = [
  { face: '#2F45E3', edge: '#2337B8' },
  { face: '#0E7C86', edge: '#0A5E66' },
  { face: '#7A3FD1', edge: '#5E2EA8' },
  { face: '#C2410C', edge: '#9A3309' },
  { face: '#BE185D', edge: '#96124A' },
  { face: '#157A44', edge: '#0F5C33' },
];

/** Forms and reading pages never stretch wider than this. */
export const MAX_CONTENT_WIDTH = 760;
/** Pages made of tiles and grids (Home, Courses, Admin) use this on wide screens. */
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
