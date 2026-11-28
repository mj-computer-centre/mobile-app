import {
  formatCountdown,
  formatDateTime,
  formatDistance,
  formatMinutes,
  formatTime,
  formatWindow,
  timeLeftMs,
  toAppError,
  type MyTest,
  type TestPhase,
} from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Notice, spacing } from '@/ui';

/**
 * How many whole minutes a student would get by starting now: the test's duration, or what is
 * left of its window when that is less. An attempt always ends when the window closes.
 */
export function minutesIfStartedNow(
  test: Pick<MyTest, 'durationMinutes' | 'endsAt'>,
  now: number,
): number {
  const untilClose = (Date.parse(test.endsAt) - now) / 60_000;
  return Math.max(1, Math.round(Math.min(test.durationMinutes, untilClose)));
}

/**
 * The part of a test's page that says where the test stands for this student and offers the
 * one thing they can do about it: wait, start, start late, carry on, or nothing.
 */
export function TestEntry({
  test,
  phase,
  now,
  starting,
  startError,
  onStart,
  onContinue,
}: {
  test: MyTest;
  phase: Exclude<TestPhase, 'finished'>;
  /** The server's time. */
  now: number;
  starting: boolean;
  startError: unknown;
  onStart: () => void;
  onContinue: () => void;
}) {
  const duration = formatMinutes(test.durationMinutes);
  const window = formatWindow(test.startsAt, test.endsAt);
  const error = startError ? (
    <AppText color="danger" accessibilityLiveRegion="polite">
      {toAppError(startError).message}
    </AppText>
  ) : null;

  if (phase === 'upcoming') {
    return (
      <Notice
        tone="primary"
        icon="calendar-clock-outline"
        title={`Opens on ${formatDateTime(test.startsAt)}`}>
        {`That is in ${formatDistance(Date.parse(test.startsAt) - now)}. Come back then to start the test.${
          test.allowLate ? ' If you miss it, you can still take it late.' : ''
        }`}
      </Notice>
    );
  }

  if (phase === 'missed') {
    return (
      <Notice tone="neutral" icon="clipboard-text-off-outline" title="You missed this test">
        {`It was open on ${window}. If you could not take it, ask the centre whether it can be opened again.`}
      </Notice>
    );
  }

  if (phase === 'in_progress') {
    return (
      <View style={styles.block}>
        <Notice tone="warning" icon="timer-sand" title="Your test is running">
          {test.attempt
            ? `Time left: ${formatCountdown(timeLeftMs(test.attempt, now))}. The clock does not stop while you are away.`
            : 'The clock does not stop while you are away.'}
        </Notice>
        <Button
          label="Continue test"
          variant="accent"
          iconAfter="arrow-right"
          onPress={onContinue}
        />
      </View>
    );
  }

  if (phase === 'late_open') {
    return (
      <View style={styles.block}>
        <Notice tone="warning" icon="history" title="You missed this test">
          {`It was open on ${window}. The centre lets you take it late: you get the full ${duration}, and your attempt is marked as taken late.`}
        </Notice>
        <Button
          label="Take the test late"
          icon="play"
          variant="accent"
          loading={starting}
          disabled={test.questionCount === 0}
          onPress={onStart}
        />
        {error}
      </View>
    );
  }

  // Open now. Starting close to the end leaves less than the full time: say so before they start.
  const available = minutesIfStartedNow(test, now);
  return (
    <View style={styles.block}>
      {test.questionCount === 0 ? (
        <Notice tone="neutral" icon="timer-sand">
          The centre has not added the questions yet. Check again in a little while.
        </Notice>
      ) : available < test.durationMinutes ? (
        <Notice tone="warning" icon="clock-alert-outline">
          {`This test closes at ${formatTime(test.endsAt)}. If you start now you get about ${formatMinutes(available)}, not the full ${duration}.`}
        </Notice>
      ) : null}
      <Button
        label="Start test"
        icon="play"
        variant="accent"
        loading={starting}
        disabled={test.questionCount === 0}
        onPress={onStart}
      />
      {error}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.md },
});
