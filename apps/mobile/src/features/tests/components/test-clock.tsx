import { formatCountdown, timeLeftMs } from '@mcc/shared';
import { StyleSheet, Text, View } from 'react-native';

import { AppText, fonts, Icon, radius, spacing, useTheme, type ColorName } from '@/ui';

import { useServerNow } from '../hooks';

const MINUTE = 60_000;

/** "4 minutes 10 seconds", for screen readers: a clock face reads badly aloud. */
function spokenTime(milliseconds: number): string {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const parts = [
    { value: Math.floor(seconds / 3600), unit: 'hour' },
    { value: Math.floor((seconds % 3600) / 60), unit: 'minute' },
    { value: seconds % 60, unit: 'second' },
  ].filter((part) => part.value > 0);
  if (parts.length === 0) return 'none';
  return parts.map((part) => `${part.value} ${part.unit}${part.value === 1 ? '' : 's'}`).join(' ');
}

/**
 * The time a student has left, counting down by itself from the server's deadline. It turns
 * amber in the last five minutes and red in the last one. `compact` sits in a header; `large`
 * is the clock of the side panel on wide screens.
 */
export function TestClock({
  deadlineAt,
  clockOffsetMs,
  size = 'compact',
}: {
  deadlineAt: string;
  clockOffsetMs: number;
  size?: 'compact' | 'large';
}) {
  const { colors } = useTheme();
  // Twice a second, so the seconds never appear to skip.
  const now = useServerNow(clockOffsetMs, 500);
  const left = timeLeftMs({ deadlineAt }, now);
  const urgency: 'calm' | 'soon' | 'now' =
    left <= MINUTE ? 'now' : left <= 5 * MINUTE ? 'soon' : 'calm';
  const ink: ColorName = urgency === 'now' ? 'danger' : urgency === 'soon' ? 'warning' : 'text';
  const label = `Time left: ${spokenTime(left)}`;

  if (size === 'large') {
    return (
      <AppText
        variant="numeral"
        color={ink}
        accessibilityRole="timer"
        accessibilityLabel={label}
        style={styles.large}>
        {formatCountdown(left)}
      </AppText>
    );
  }

  const background: ColorName =
    urgency === 'now' ? 'dangerSoft' : urgency === 'soon' ? 'warningSoft' : 'surfaceMuted';
  return (
    <View
      accessible
      accessibilityRole="timer"
      accessibilityLabel={label}
      style={[styles.compact, { backgroundColor: colors[background] }]}>
      <Icon name="timer-outline" size={17} color={ink} />
      <Text style={[styles.compactText, { color: colors[ink] }]}>{formatCountdown(left)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  large: { fontSize: 48, lineHeight: 52 },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  // Digits of one width, so the pill does not change size as the seconds pass.
  compactText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 20,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
});
