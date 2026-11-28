import { formatTimeTaken, type TestResult } from '@mcc/shared';
import { Pressable, StyleSheet, View, type PressableStateCallbackType } from 'react-native';

import { AppText, Avatar, Badge, Icon, spacing, useTheme } from '@/ui';

type RowState = PressableStateCallbackType & { hovered?: boolean };

/** The name to show for a student who took a test. */
export function resultName(result: Pick<TestResult, 'fullName' | 'email'>): string {
  return result.fullName || result.email || 'Unnamed student';
}

/**
 * One student in a test's results: their place, name, how they did, and their score. Pressing
 * the row opens their answers.
 */
export function ResultRow({
  result,
  place,
  questionCount,
  totalMarks,
  onPress,
}: {
  result: TestResult;
  /** Their place in the full list, best score first, counted from 1. */
  place: number;
  questionCount: number;
  totalMarks: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const name = resultName(result);
  const detail = `${result.correctCount} of ${questionCount} correct · ${formatTimeTaken(result.timeTakenSeconds)}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Place ${place}. ${name}. ${result.score} out of ${totalMarks}. ${detail}`}
      accessibilityHint="Opens this student’s answers"
      onPress={onPress}
      android_ripple={{ color: colors.surfaceMuted }}
      style={(state: RowState) => [
        styles.row,
        (state.pressed || state.hovered) && { backgroundColor: colors.surfaceMuted },
      ]}>
      <AppText variant="label" color="textMuted" style={styles.place}>
        {place}
      </AppText>
      <Avatar name={name} size={40} />
      <View style={styles.text}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>
          {detail}
        </AppText>
        {result.isLate || !result.isFinished ? (
          <View style={styles.badges}>
            {result.isFinished ? null : (
              <Badge label="Still taking it" tone="warning" icon="timer-sand" />
            )}
            {result.isLate ? <Badge label="Taken late" tone="accent" icon="history" /> : null}
          </View>
        ) : null}
      </View>
      <View style={styles.score}>
        <AppText variant="subheading">{result.score}</AppText>
        <AppText variant="caption" color="textMuted">
          / {totalMarks}
        </AppText>
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
    minHeight: 64,
    paddingVertical: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
  },
  // Wide enough for three digits, so names line up down the list.
  place: { minWidth: 26, textAlign: 'right', fontVariant: ['tabular-nums'] },
  text: { flex: 1, gap: 2, minWidth: 0 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs / 2 },
  score: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
});
