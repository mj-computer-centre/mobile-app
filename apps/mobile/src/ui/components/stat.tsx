import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { spacing, type ColorName } from '../theme';
import { AppText } from './app-text';

/** A number with what it counts underneath: "46" over "video lessons". */
export function Stat({
  value,
  label,
  size = 'md',
  color = 'text',
  labelColor = 'textMuted',
  align = 'left',
  style,
}: {
  value: string | number | undefined;
  label: string;
  size?: 'md' | 'lg';
  color?: ColorName;
  labelColor?: ColorName;
  align?: 'left' | 'center';
  style?: StyleProp<ViewStyle>;
}) {
  const text = value === undefined ? '–' : String(value);
  return (
    <View
      accessible
      accessibilityLabel={`${text} ${label}`}
      style={[styles.stat, align === 'center' && styles.centre, style]}>
      <AppText variant="numeral" color={color} style={size === 'md' ? styles.medium : undefined}>
        {text}
      </AppText>
      <AppText variant="caption" color={labelColor} numberOfLines={2}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: { gap: spacing.xs / 2, minWidth: 0 },
  centre: { alignItems: 'center' },
  medium: { fontSize: 28, lineHeight: 32 },
});
