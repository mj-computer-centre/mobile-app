import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { fonts, keyDepth, radius, useTheme } from '../theme';
import { Key, keyTones, type KeyTone } from './key';

export interface KeyCapProps {
  /** One to four characters: an option letter, a question number, a course's short name. */
  legend: string;
  size?: number;
  tone?: KeyTone;
  latched?: boolean;
  onPress?: (() => void) | undefined;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'radio' | 'checkbox';
  accessibilityState?: { selected?: boolean; checked?: boolean };
  style?: StyleProp<ViewStyle>;
}

/** A square key with a legend: answer options, the question grid, the brand mark. */
export function KeyCap({
  legend,
  size = 44,
  tone = 'neutral',
  latched,
  onPress,
  disabled,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  style,
}: KeyCapProps) {
  const { colors } = useTheme();
  const depth = size >= 64 ? keyDepth.lg : size >= 40 ? keyDepth.md : keyDepth.sm;
  // Longer legends shrink so "ADCA" fits where "A" does.
  const fontSize = Math.round(
    size * (legend.length <= 1 ? 0.46 : legend.length === 2 ? 0.38 : 0.28),
  );

  return (
    <Key
      tone={tone}
      depth={depth}
      cornerRadius={size >= 64 ? radius.lg : size >= 40 ? radius.md : radius.sm}
      latched={latched ?? false}
      onPress={onPress}
      disabled={disabled ?? false}
      // Small keys (calendar days, the question grid) sit close together; a little margin
      // makes each one easier to hit without overlapping its neighbours.
      {...(size < 44 ? { hitSlop: 3 } : {})}
      accessibilityLabel={accessibilityLabel ?? legend}
      {...(accessibilityRole ? { accessibilityRole } : {})}
      {...(accessibilityState ? { accessibilityState } : {})}
      style={[{ width: size }, style]}
      faceStyle={{ height: size - depth }}>
      <Text
        numberOfLines={1}
        style={[
          styles.legend,
          { fontSize, lineHeight: Math.round(fontSize * 1.2), color: colors[keyTones[tone].ink] },
        ]}>
        {legend}
      </Text>
    </Key>
  );
}

const styles = StyleSheet.create({
  legend: { fontFamily: fonts.display, includeFontPadding: false, textAlign: 'center' },
});
