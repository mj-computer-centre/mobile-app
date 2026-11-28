import { calendarLeaf, formatDate } from '@mcc/shared';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, radius, useTheme } from '@/ui';

/**
 * The day of a test, drawn as a leaf of a tear-off calendar: the month on a marigold band, the
 * date beneath it. `onHero` for use on the dark brand colour.
 */
export function CalendarLeaf({ date, onHero = false }: { date: string; onHero?: boolean }) {
  const { colors } = useTheme();
  const leaf = calendarLeaf(date);
  return (
    <View
      accessible
      accessibilityLabel={`${leaf.weekday}, ${formatDate(date)}`}
      style={[
        styles.leaf,
        {
          backgroundColor: onHero ? colors.heroRaised : colors.surface,
          borderColor: onHero ? colors.heroRaised : colors.border,
        },
      ]}>
      <View style={[styles.band, { backgroundColor: colors.accent }]}>
        <Text style={[styles.month, { color: colors.onAccent }]}>{leaf.month}</Text>
      </View>
      <Text style={[styles.day, { color: onHero ? colors.onHero : colors.text }]}>{leaf.day}</Text>
      <Text style={[styles.weekday, { color: onHero ? colors.onHeroMuted : colors.textMuted }]}>
        {leaf.weekday}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  leaf: {
    width: 54,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 5,
  },
  band: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: 2 },
  month: { fontFamily: fonts.label, fontSize: 12, lineHeight: 16, includeFontPadding: false },
  day: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    marginTop: 3,
    includeFontPadding: false,
  },
  weekday: { fontSize: 11, lineHeight: 14 },
});
