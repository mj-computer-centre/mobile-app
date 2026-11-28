import { Pressable, StyleSheet, View } from 'react-native';

import { radius, shadows, spacing, useTheme } from '../theme';
import { AppText } from './app-text';

export interface Segment<Value extends string> {
  value: Value;
  label: string;
}

export interface SegmentedControlProps<Value extends string> {
  segments: readonly Segment<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  accessibilityLabel?: string;
}

/** Two to four views of the same list, switched in place ("Units" / "Videos and PDFs"). */
export function SegmentedControl<Value extends string>({
  segments,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<Value>) {
  const { colors, dark } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
      {segments.map((segment) => {
        const selected = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            accessibilityRole="tab"
            accessibilityLabel={segment.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(segment.value)}
            style={[
              styles.segment,
              selected && { backgroundColor: colors.surface },
              selected && !dark && shadows.card,
            ]}>
            <AppText
              variant="label"
              color={selected ? 'text' : 'textMuted'}
              numberOfLines={1}
              style={styles.label}>
              {segment.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 3, borderRadius: radius.md, gap: 3 },
  segment: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md - 3,
  },
  label: { includeFontPadding: false },
});
