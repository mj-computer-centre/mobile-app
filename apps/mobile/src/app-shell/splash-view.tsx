import { StyleSheet, View } from 'react-native';

import { BrandMark, useTheme } from '@/ui';

/**
 * Shown on the web while the stored session is being read (a phone keeps its native splash
 * screen up instead). Matches the mark in public/index.html, so the page does not flash.
 */
export function SplashView() {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.root, { backgroundColor: colors.background }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading">
      <BrandMark size={64} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
