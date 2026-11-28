import { formatDateTime, formatIndianMobile, toAppError } from '@mcc/shared';
import { router, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  ReviewQuestionCard,
  Scorecard,
  useAttemptReview,
  useAttemptSummary,
} from '@/features/tests';
import { confirmAction, showMessage } from '@/lib/platform/confirm';
import {
  AppText,
  Avatar,
  Button,
  Divider,
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
  Screen,
  SectionHeader,
  SkeletonRows,
  spacing,
} from '@/ui';

import { resultName } from './components/result-row';
import { useAdminTest, useResetAttempt, useTestResults } from './hooks';

/** One student's test, as staff see it: who, how they did, and every answer they gave. */
export function TestAttemptScreen({ testId, attemptId }: { testId: string; attemptId: string }) {
  const summary = useAttemptSummary(attemptId);
  const review = useAttemptReview(attemptId);
  const results = useTestResults(testId);
  const admin = useAdminTest(testId);
  const reset = useResetAttempt();

  if (summary.isPending) return <LoadingState />;
  if (summary.isError)
    return <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />;
  if (!summary.data) {
    return (
      <EmptyState
        icon="clipboard-remove-outline"
        title="This student’s test is no longer here"
        message="They may have been allowed to take the test again, which removes their earlier answers."
        action={{ label: 'Back to the results', onPress: () => router.back() }}
      />
    );
  }

  const attempt = summary.data;
  const student = results.data?.find((result) => result.attemptId === attemptId);
  const name = student ? resultName(student) : 'Student';
  const contact = [student?.phone ? formatIndianMobile(student.phone) : null, student?.email]
    .filter(Boolean)
    .join(' · ');

  const confirmReset = async () => {
    const ok = await confirmAction({
      title: `Let ${name} take the test again?`,
      message:
        'Their answers and score for this test are deleted. They can then start it again while it is open, or afterwards if late attempts are allowed.',
      confirmLabel: 'Delete their answers',
      destructive: true,
    });
    if (!ok) return;
    reset.mutate(attemptId, {
      onSuccess: () => router.back(),
      onError: (error) => showMessage('Could not do this', toAppError(error).message),
    });
  };

  return (
    <Screen
      edges={[]}
      refreshing={summary.isRefetching}
      onRefresh={() => {
        void summary.refetch();
        void review.refetch();
      }}>
      <Stack.Screen options={{ title: name }} />

      <View style={styles.student}>
        <Avatar name={name} size={52} />
        <View style={styles.studentText}>
          <AppText variant="title" accessibilityRole="header" numberOfLines={2}>
            {name}
          </AppText>
          {contact ? (
            <AppText variant="caption" color="textMuted" selectable>
              {contact}
            </AppText>
          ) : null}
          <AppText variant="caption" color="textMuted">
            {admin.test ? `${admin.test.title} · ` : ''}started {formatDateTime(attempt.startedAt)}
          </AppText>
        </View>
      </View>

      {attempt.isFinished ? (
        <Scorecard summary={attempt} passPercent={admin.test?.passPercent ?? null} />
      ) : (
        <Notice tone="warning" title="Still taking the test" icon="timer-sand">
          {`${attempt.answeredCount} of ${attempt.questionCount} questions answered so far. The score appears when they submit or their time runs out.`}
        </Notice>
      )}

      <View style={styles.section}>
        <SectionHeader
          title="Answers"
          description={
            attempt.isFinished
              ? 'Green is the correct answer. Red is what the student chose when it was wrong.'
              : 'What the student has answered so far.'
          }
        />
        {review.isPending ? (
          <SkeletonRows />
        ) : review.isError ? (
          <ErrorState error={review.error} onRetry={() => void review.refetch()} />
        ) : review.data.length === 0 ? (
          <AppText color="textMuted">This test has no questions.</AppText>
        ) : (
          review.data.map((question, index) => (
            <View key={question.id} style={styles.question}>
              {index > 0 ? <Divider inset={0} /> : null}
              <ReviewQuestionCard question={question} number={index + 1} />
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <AppText variant="caption" color="textMuted">
          If something went wrong for this student, such as a dead phone or no internet, you can let
          them start again.
        </AppText>
        <Button
          label="Let this student take the test again"
          icon="restart"
          variant="danger"
          loading={reset.isPending}
          onPress={() => void confirmReset()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  student: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  studentText: { flex: 1, gap: 2, minWidth: 0 },
  section: { gap: spacing.md },
  // The hairline sits above the question, with the same space on both sides of it.
  question: { gap: spacing.lg, paddingTop: spacing.xs },
});
