import {
  AnekLatin_600SemiBold,
  AnekLatin_700Bold,
  AnekLatin_800ExtraBold,
} from '@expo-google-fonts/anek-latin';
import { FontDisplay, useFonts } from 'expo-font';

/**
 * Loads the three weights of Anek Latin the design system uses (ui/theme.ts, `fonts`). Each is
 * registered as its own family, which works on every Android version; the family names here
 * must match the ones in the theme.
 *
 * On the web the fonts arrive after the page, so text shows in the system font first and
 * swaps (`FontDisplay.SWAP`) instead of staying invisible on a slow connection. On a phone the
 * files are inside the app and load at once.
 *
 * Returns true once loading has finished, whether it worked or not: a missing font falls back
 * to the system font and must never keep the app on its splash screen.
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    AnekLatin_600SemiBold: { uri: AnekLatin_600SemiBold, display: FontDisplay.SWAP },
    AnekLatin_700Bold: { uri: AnekLatin_700Bold, display: FontDisplay.SWAP },
    AnekLatin_800ExtraBold: { uri: AnekLatin_800ExtraBold, display: FontDisplay.SWAP },
  });
  return loaded || error !== null;
}
