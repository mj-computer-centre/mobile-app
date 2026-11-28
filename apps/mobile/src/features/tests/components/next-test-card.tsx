import {
  formatWindow,
  groupTests,
  phaseLine,
  testPhase,
  type MyTest,
  type TestPhase,
} from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, radius, spacing, useLayout, useTheme } from '@/ui';

import { CalendarLeaf } from './calendar-leaf';
import { testSize } from './test-row';

/**
 * The test a student should know about first: one they are taking, then one that is open, then
 * the next one coming, then a missed one they may still take.
 */
export function pickFeaturedTest(tests: readonly MyTest[], now: number): MyTest | null {
  const groups = groupTests(tests, now);
  return groups.now[0] ?? groups.upcoming[0] ?? groups.late[0] ?? null;
}

const actionLabel: Record<TestPhase, string> = {
  upcoming: 'See details',
  open: 'Open test',
  in_progress: 'Continue test',
  finished: 'See result',
  late_open: 'Open test',
  missed: 'See details',
};

/**
 * The featured test, as an admit card on the brand colour: the day on a calendar leaf, the
 * name and timing, and the one action that fits where the test stands.
 */
export function NextTestCard({
  test,
  now,
  onOpen,
}: {
  test: MyTest;
  now: number;
  onOpen: () => void;
}) {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  const phase = testPhase(test, now);
  const urgent = phase === 'open' || phase === 'in_progress' || phase === 'late_open';

  return (
    <View style={[styles.card, isWide && styles.cardWide, { backgroundColor: colors.hero }]}>
      <View style={styles.top}>
        <CalendarLeaf date={test.startsAt} onHero />
        <View style={styles.text}>
          <AppText variant="heading" color="onHero" numberOfLines={2}>
            {test.title}
          </AppText>
          <AppText variant="caption" color="onHeroMuted">
            {formatWindow(test.startsAt, test.endsAt)}
          </AppText>
          <AppText variant="caption" color="onHeroMuted">
            {testSize(test)}
          </AppText>
        </View>
      </View>

      {/* The tear line of an admit card: notches cut from both edges. */}
      <View style={styles.tear}>
        <View style={[styles.notch, styles.notchLeft, { backgroundColor: colors.background }]} />
        <View style={[styles.line, { backgroundColor: colors.onHeroSubtle }]} />
        <View style={[styles.notch, styles.notchRight, { backgroundColor: colors.background }]} />
      </View>

      <View style={[styles.bottom, isWide && styles.bottomWide]}>
        <AppText color="onHero" style={styles.phase}>
          {phaseLine(test, now)}
        </AppText>
        <Button
          label={actionLabel[phase]}
          variant={urgent ? 'accent' : 'secondary'}
          iconAfter="arrow-right"
          onPress={onOpen}
        />
      </View>
    </View>
  );
}

const NOTCH = 18;

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, overflow: 'hidden' },
  cardWide: { maxWidth: 560 },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg },
  text: { flex: 1, gap: 2 },
  tear: { height: NOTCH, justifyContent: 'center' },
  line: { height: 2, marginHorizontal: NOTCH },
  notch: {
    position: 'absolute',
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
  },
  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },
  bottom: { padding: spacing.lg, gap: spacing.md },
  bottomWide: { flexDirection: 'row', alignItems: 'center' },
  phase: { flex: 1 },
});
