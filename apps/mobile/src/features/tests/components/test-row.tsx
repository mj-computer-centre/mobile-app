import {
  formatMinutes,
  formatWindow,
  phaseLine,
  scorePercent,
  testPhase,
  type MyTest,
  type TestPhase,
} from '@mcc/shared';
import { Pressable, StyleSheet, View, type PressableStateCallbackType } from 'react-native';

import { AppText, Badge, Icon, spacing, useTheme, type Tone } from '@/ui';

import { CalendarLeaf } from './calendar-leaf';

const phaseBadge: Record<TestPhase, { label: string; tone: Tone } | null> = {
  upcoming: null,
  open: { label: 'Open now', tone: 'success' },
  in_progress: { label: 'In progress', tone: 'warning' },
  finished: null, // the score is shown instead
  late_open: { label: 'Take it late', tone: 'accent' },
  missed: { label: 'Missed', tone: 'neutral' },
};

/** "20 questions · 30 min", the size of a test in one line. */
export function testSize(test: { questionCount: number; durationMinutes: number }): string {
  return `${test.questionCount} question${test.questionCount === 1 ? '' : 's'} · ${formatMinutes(test.durationMinutes)}`;
}

type RowState = PressableStateCallbackType & { hovered?: boolean };

/** One test in a list: its day, name, when it is open, and where it stands for this student. */
export function TestRow({
  test,
  now,
  onPress,
}: {
  test: MyTest;
  /** The server's time, from useServerNow. */
  now: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const phase = testPhase(test, now);
  const badge = phaseBadge[phase];
  const line = phaseLine(test, now);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${test.title}. ${line}. ${formatWindow(test.startsAt, test.endsAt)}`}
      accessibilityHint="Opens the test"
      onPress={onPress}
      android_ripple={{ color: colors.surfaceMuted }}
      style={(state: RowState) => [
        styles.row,
        (state.pressed || state.hovered) && { backgroundColor: colors.surfaceMuted },
      ]}>
      <CalendarLeaf date={test.startsAt} />
      <View style={styles.text}>
        <AppText variant="subheading" numberOfLines={2}>
          {test.title}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {formatWindow(test.startsAt, test.endsAt)}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {test.courseTitle ? `${test.courseTitle} · ` : ''}
          {testSize(test)}
        </AppText>
        <View style={styles.status}>
          {badge ? <Badge label={badge.label} tone={badge.tone} /> : null}
          {phase === 'finished' && test.score !== null ? (
            <Badge
              label={`${test.score} / ${test.totalMarks} · ${scorePercent(test.score, test.totalMarks)}%`}
              tone="primary"
            />
          ) : null}
          {phase === 'upcoming' || phase === 'in_progress' || phase === 'open' ? (
            <AppText variant="caption" color="textMuted">
              {line}
            </AppText>
          ) : null}
        </View>
      </View>
      <Icon name="chevron-right" color="textFaint" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  text: { flex: 1, gap: 2 },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
