import { formatMinutes, formatTime, formatWindow, phaseLine, testPhase } from '@mcc/shared';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { StaffActions } from '@/features/auth';
import { confirmAction } from '@/lib/platform/confirm';
import { routes } from '@/lib/routes';
import {
  AppText,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
  radius,
  Screen,
  Skeleton,
  spacing,
} from '@/ui';

import { CalendarLeaf } from '../components/calendar-leaf';
import { minutesIfStartedNow, TestEntry } from '../components/test-entry';
import { TestFacts } from '../components/test-facts';
import { TestResult } from '../components/test-result';
import { TestRules } from '../components/test-rules';
import { useAttemptSummary, useMyTest, useServerNow, useStartTest } from '../hooks';

/**
 * A test's own page. Before the test it says what the test is and when; while the test is open
 * it is where the student starts or carries on; afterwards it shows the result. The page
 * follows the clock by itself: a test opens, closes and reveals its answers without a refresh.
 */
export function TestScreen({ testId }: { testId: string }) {
  const { test, clockOffsetMs, isError, error, isRefetching, refetch } = useMyTest(testId);
  // A submitted test changes only when its window closes. Anything else is watched by the
  // second, so "Start" appears the moment the test opens and the time left counts down.
  const submitted = Boolean(test?.attempt?.submittedAt);
  const now = useServerNow(clockOffsetMs, submitted ? 30_000 : 1000);
  const phase = test ? testPhase(test, now) : null;
  const attemptId = phase === 'finished' ? test?.attempt?.id : undefined;
  const summary = useAttemptSummary(attemptId);
  const refetchSummary = summary.refetch;
  const start = useStartTest();

  // The list was fetched while the test was still running: fetch it again for the score.
  const scoreMissing = phase === 'finished' && test?.score === null;
  useEffect(() => {
    if (scoreMissing) void refetch();
  }, [scoreMissing, refetch]);

  // The result was fetched before the test closed for everyone. Now that it has, the answers
  // and the rank are open: fetch the result again to get them.
  const result = summary.data;
  const closed = test ? now >= Date.parse(test.endsAt) : false;
  const resultIsBehind =
    closed &&
    result?.isFinished === true &&
    ((test?.showReview === true && !result.reviewAvailable) ||
      (!result.isLate && result.rank === null));
  useEffect(() => {
    if (resultIsBehind) void refetchSummary();
  }, [resultIsBehind, refetchSummary]);

  if (test === undefined) {
    return isError ? <ErrorState error={error} onRetry={() => void refetch()} /> : <LoadingState />;
  }
  if (test === null || phase === null) {
    return (
      <EmptyState
        icon="clipboard-text-off-outline"
        title="This test is no longer available"
        message="The centre may have removed it."
        action={{ label: 'All tests', onPress: () => router.replace(routes.tests) }}
      />
    );
  }

  const begin = async (late: boolean) => {
    const available = minutesIfStartedNow(test, now);
    const time =
      !late && available < test.durationMinutes
        ? `The test closes at ${formatTime(test.endsAt)}, so you have about ${formatMinutes(available)}.`
        : `You have ${formatMinutes(test.durationMinutes)}.`;
    const ok = await confirmAction({
      title: late ? 'Take the test late?' : 'Start the test now?',
      message: `The clock starts at once and cannot be paused. ${time}${
        late ? ' Your attempt will be marked as taken late.' : ''
      }`,
      confirmLabel: 'Start test',
    });
    if (ok) start.mutate(test.id, { onSuccess: () => router.push(routes.takeTest(test.id)) });
  };

  return (
    <Screen
      edges={[]}
      refreshing={isRefetching}
      onRefresh={() => {
        void refetch();
        if (attemptId) void refetchSummary();
      }}>
      <View style={styles.heading}>
        <AppText variant="display" accessibilityRole="header">
          {test.title}
        </AppText>
        {test.courseTitle ? <AppText color="textMuted">{test.courseTitle}</AppText> : null}
      </View>

      <View style={styles.about}>
        <View style={styles.when}>
          <CalendarLeaf date={test.startsAt} />
          <View style={styles.whenText}>
            <AppText variant="bodyStrong">{formatWindow(test.startsAt, test.endsAt)}</AppText>
            <AppText variant="caption" color="textMuted">
              {phaseLine(test, now)}
            </AppText>
          </View>
        </View>
        <TestFacts test={test} />
      </View>

      {phase !== 'finished' ? (
        <TestEntry
          test={test}
          phase={phase}
          now={now}
          starting={start.isPending}
          startError={start.error}
          onStart={() => void begin(phase === 'late_open')}
          onContinue={() => router.push(routes.takeTest(test.id))}
        />
      ) : result?.isFinished ? (
        <TestResult
          test={test}
          summary={result}
          onReview={() => router.push(routes.reviewTest(test.id))}
        />
      ) : summary.isPending ? (
        <Skeleton height={240} rounded={radius.xl} />
      ) : summary.isError ? (
        <ErrorState error={summary.error} onRetry={() => void refetchSummary()} />
      ) : (
        <Notice tone="neutral" icon="timer-sand" title="Your result is being worked out">
          Pull down to refresh in a moment.
        </Notice>
      )}

      {phase === 'upcoming' || phase === 'open' || phase === 'late_open' ? (
        <TestRules test={test} late={phase === 'late_open'} />
      ) : null}

      <StaffActions note="This is the page students see. Students do not see this box.">
        <Button
          label="Edit this test"
          icon="pencil-outline"
          variant="secondary"
          compact
          onPress={() => router.push(routes.admin.test(test.id))}
        />
        <Button
          label="Results"
          icon="chart-box-outline"
          variant="secondary"
          compact
          onPress={() => router.push(routes.admin.testResults(test.id))}
        />
      </StaffActions>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.xs },
  about: { gap: spacing.md },
  when: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  whenText: { flex: 1, gap: 2 },
});
