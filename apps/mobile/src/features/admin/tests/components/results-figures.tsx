import { testOutcome, type TestResult } from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { spacing, Stat } from '@/ui';

/**
 * How a test went, in four numbers worked out from the results themselves. Averages and the
 * highest score count only students who have finished; someone still answering would drag
 * them down.
 */
export function ResultsFigures({
  results,
  totalMarks,
  passPercent,
}: {
  results: TestResult[];
  totalMarks: number;
  passPercent: number | null;
}) {
  const scores = results.filter((result) => result.isFinished).map((result) => result.score);
  const average =
    scores.length > 0
      ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
      : undefined;
  const highest = scores.length > 0 ? Math.max(...scores) : undefined;
  const passed =
    passPercent === null
      ? null
      : scores.filter((score) => testOutcome(score, totalMarks, passPercent) === 'passed').length;

  return (
    <View style={styles.figures}>
      <Stat
        value={results.length}
        label={results.length === 1 ? 'student took it' : 'students took it'}
        style={styles.figure}
      />
      <Stat value={average} label={`average score out of ${totalMarks}`} style={styles.figure} />
      <Stat value={highest} label="highest score" style={styles.figure} />
      {passed !== null ? (
        <Stat value={passed} label={`passed (${passPercent}% needed)`} style={styles.figure} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  figures: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xl, rowGap: spacing.lg },
  figure: { flexGrow: 1, flexBasis: 120 },
});
