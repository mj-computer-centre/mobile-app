import { fonts, useTheme } from '@/ui';

/**
 * Header styling shared by every navigator, so stack and tab headers look the same: the page
 * colour instead of a white bar, the brand typeface for titles, and no shadow line.
 */
export function useHeaderOptions() {
  const { colors } = useTheme();
  return {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerTitleStyle: { fontFamily: fonts.heading, fontSize: 18, color: colors.text },
    headerShadowVisible: false,
  } as const;
}
