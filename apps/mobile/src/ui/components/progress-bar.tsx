import { StyleSheet, View } from 'react-native';

import { radius, useTheme, type ColorName } from '../theme';

/** How far along something is, from 0 to 1. */
export function ProgressBar({
  value,
  color = 'primary',
  track = 'surfaceMuted',
  height = 8,
  accessibilityLabel,
}: {
  value: number;
  color?: ColorName;
  track?: ColorName;
  height?: number;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();
  const fraction = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(fraction * 100) }}
      style={[styles.track, { height, backgroundColor: colors[track] }]}>
      <View
        style={[styles.fill, { width: `${fraction * 100}%`, backgroundColor: colors[color] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
