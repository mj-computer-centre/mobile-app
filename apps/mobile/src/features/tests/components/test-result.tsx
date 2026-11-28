import { formatDateTime, type AttemptSummary, type MyTest } from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Notice, spacing } from '@/ui';

import { Scorecard } from './scorecard';

/**
 * A finished test on its own page: the scorecard, then the way to the answers. The correct
 * answers and the rank open only after the test has closed for everyone, so nobody still
 * taking it can be told them; until then this says when they will open.
 */
export function TestResult({
  test,
  summary,
  onReview,
}: {
  test: MyTest;
  summary: AttemptSummary;
  onReview: () => void;
}) {
  // A late attempt is never ranked: the rank compares students who took the test in time.
  const rankPending = summary.rank === null && !summary.isLate;
  const closes = formatDateTime(test.endsAt);

  return (
    <View style={styles.block}>
      <Scorecard summary={summary} passPercent={test.passPercent} />
      {summary.reviewAvailable ? (
        <Button label="See the answers" icon="eye-outline" onPress={onReview} />
      ) : test.showReview ? (
        <Notice tone="primary" icon="lock-clock" title="The answers open after the test closes">
          {`The correct answers${rankPending ? ' and your rank' : ''} can be seen once the test has closed for everyone, on ${closes}.`}
        </Notice>
      ) : (
        <AppText color="textMuted">
          {`The centre does not show the answers to this test.${
            rankPending
              ? ` Your rank appears after the test closes for everyone, on ${closes}.`
              : ''
          }`}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.lg },
});
