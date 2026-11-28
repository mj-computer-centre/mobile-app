import { formatTimeTaken, scorePercent, testOutcome, type AttemptSummary } from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { AppText, Badge, ProgressBar, radius, spacing, Stat, useTheme } from '@/ui';

/**
 * The result of a finished attempt: the score, whether it passed, and how the answers fell.
 * Shown to the student after their test and to staff looking at one student's attempt.
 */
export function Scorecard({
  summary,
  passPercent,
}: {
  summary: AttemptSummary;
  passPercent: number | null;
}) {
  const { colors } = useTheme();
  const score = summary.score ?? 0;
  const correct = summary.correctCount ?? 0;
  const percent = scorePercent(score, summary.totalMarks);
  const outcome = testOutcome(score, summary.totalMarks, passPercent);
  const wrong = Math.max(0, summary.answeredCount - correct);
  const skipped = Math.max(0, summary.questionCount - summary.answeredCount);

  return (
    <View style={[styles.card, { backgroundColor: colors.hero }]}>
      <View style={styles.top}>
        <View
          style={styles.score}
          accessible
          accessibilityLabel={`${score} out of ${summary.totalMarks} marks, ${percent} percent`}>
          <AppText variant="numeral" color="onHero" style={styles.scoreValue}>
            {score}
          </AppText>
          <AppText variant="heading" color="onHeroMuted">
            / {summary.totalMarks}
          </AppText>
        </View>
        <View style={styles.badges}>
          {outcome ? (
            <Badge
              label={outcome === 'passed' ? 'Passed' : 'Not passed'}
              tone={outcome === 'passed' ? 'success' : 'danger'}
              icon={outcome === 'passed' ? 'check-decagram' : 'close-octagon-outline'}
            />
          ) : null}
          {summary.isLate ? <Badge label="Taken late" tone="warning" icon="history" /> : null}
        </View>
      </View>

      <View style={styles.bar}>
        <ProgressBar
          value={percent / 100}
          color="accent"
          track="heroRaised"
          height={10}
          accessibilityLabel={`${percent} percent`}
        />
        <AppText variant="caption" color="onHeroMuted">
          {percent}%{passPercent !== null ? ` · pass mark ${passPercent}%` : ''}
        </AppText>
      </View>

      <View style={styles.stats}>
        <Stat value={correct} label="correct" color="onHero" labelColor="onHeroMuted" />
        <Stat value={wrong} label="wrong" color="onHero" labelColor="onHeroMuted" />
        <Stat value={skipped} label="not answered" color="onHero" labelColor="onHeroMuted" />
        {summary.rank !== null && summary.rankOutOf !== null ? (
          <Stat
            value={summary.rank}
            label={`rank of ${summary.rankOutOf}`}
            color="onHero"
            labelColor="onHeroMuted"
          />
        ) : null}
      </View>
      <AppText variant="caption" color="onHeroMuted">
        Time taken: {formatTimeTaken(summary.timeTakenSeconds)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  score: { flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  scoreValue: { fontSize: 56, lineHeight: 60 },
  badges: { alignItems: 'flex-end', gap: spacing.xs },
  bar: { gap: spacing.xs },
  stats: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xl, rowGap: spacing.md },
});
