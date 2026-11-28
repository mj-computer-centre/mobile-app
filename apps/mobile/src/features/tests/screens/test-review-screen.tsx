import { formatDateTime, type ReviewQuestion } from '@mcc/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { routes } from '@/lib/routes';
import {
  AppText,
  Divider,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SegmentedControl,
  SkeletonRows,
  spacing,
  useLayout,
} from '@/ui';

import { ReviewQuestionCard } from '../components/review-question';
import { useAttemptReview, useAttemptSummary, useMyTest } from '../hooks';

type Filter = 'all' | 'wrong' | 'skipped';

function matches(question: ReviewQuestion, filter: Filter): boolean {
  if (filter === 'all') return true;
  const skipped = question.selectedOption === null;
  if (filter === 'skipped') return skipped;
  return !skipped && question.selectedOption !== question.correctOption;
}

const EMPTY_FILTER: Record<Exclude<Filter, 'all'>, string> = {
  wrong: 'You got no question wrong.',
  skipped: 'You did not skip any question.',
};

/**
 * Every question of a finished test with what the student chose and the right answer. The
 * database decides when this opens (after the test has closed for everyone, and only for tests
 * that show their answers); until then the page says why it is empty.
 */
export function TestReviewScreen({ testId }: { testId: string }) {
  const { test, isError, error, refetch } = useMyTest(testId);
  const { isWide } = useLayout();
  const attemptId = test?.attempt?.id;
  const summary = useAttemptSummary(attemptId);
  const available = summary.data?.reviewAvailable === true;
  const review = useAttemptReview(attemptId, available);
  const [filter, setFilter] = useState<Filter>('all');

  const backToTest = {
    label: 'Back to the test',
    onPress: () => router.dismissTo(routes.test(testId)),
  };

  if (test === undefined) {
    return isError ? <ErrorState error={error} onRetry={() => void refetch()} /> : <LoadingState />;
  }
  if (test === null) {
    return (
      <EmptyState
        icon="clipboard-text-off-outline"
        title="This test is no longer available"
        message="The centre may have removed it."
        action={{ label: 'All tests', onPress: () => router.replace(routes.tests) }}
      />
    );
  }
  if (!attemptId) {
    return (
      <EmptyState
        icon="clipboard-text-clock-outline"
        title="You have not taken this test"
        message="The answers are shown to students who took it."
        action={backToTest}
      />
    );
  }
  if (!summary.data) {
    if (summary.isPending) return <LoadingState />;
    if (summary.isError) {
      return <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />;
    }
    return (
      <EmptyState
        icon="clipboard-text-off-outline"
        title="This result is not available"
        action={backToTest}
      />
    );
  }
  if (!summary.data.isFinished) {
    return (
      <EmptyState
        icon="timer-sand"
        title="Finish the test first"
        message="The answers are shown after you submit and the test has closed."
        action={backToTest}
      />
    );
  }
  if (!available) {
    return test.showReview ? (
      <EmptyState
        icon="lock-clock"
        title="The answers open after the test closes"
        message={`They can be seen once the test has closed for everyone, on ${formatDateTime(test.endsAt)}.`}
        action={backToTest}
      />
    ) : (
      <EmptyState
        icon="eye-off-outline"
        title="This test does not show its answers"
        message="The centre chose not to show the correct answers to this test."
        action={backToTest}
      />
    );
  }

  const result = summary.data;
  const questions = review.data ?? [];
  const count = (kind: Filter) => questions.filter((question) => matches(question, kind)).length;
  const shown = questions.filter((question) => matches(question, filter));

  return (
    <Screen scroll={false} padded={false} edges={['bottom']}>
      <FlatList
        data={shown}
        keyExtractor={(question) => question.id}
        contentContainerStyle={isWide ? styles.contentWide : styles.content}
        ItemSeparatorComponent={Separator}
        refreshing={review.isRefetching}
        onRefresh={() => void review.refetch()}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titles}>
              <AppText variant="title" accessibilityRole="header">
                {test.title}
              </AppText>
              <AppText color="textMuted">
                You scored {result.score ?? 0} out of {result.totalMarks}.
              </AppText>
            </View>
            {review.data ? (
              <SegmentedControl
                accessibilityLabel="Which questions to show"
                segments={[
                  { value: 'all', label: `All (${count('all')})` },
                  { value: 'wrong', label: `Wrong (${count('wrong')})` },
                  // "Skipped", not "Not answered": three labels with counts must fit a small phone.
                  { value: 'skipped', label: `Skipped (${count('skipped')})` },
                ]}
                value={filter}
                onChange={setFilter}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          review.isPending ? (
            <SkeletonRows count={4} />
          ) : review.isError ? (
            <ErrorState error={review.error} onRetry={() => void review.refetch()} />
          ) : (
            <AppText color="textMuted" style={styles.none}>
              {filter === 'all' ? 'This test has no questions.' : EMPTY_FILTER[filter]}
            </AppText>
          )
        }
        renderItem={({ item }) => <ReviewQuestionCard question={item} number={item.position + 1} />}
      />
    </Screen>
  );
}

/** A rule with air on both sides: questions are tall, and the eye needs to see where one ends. */
function Separator() {
  return (
    <View style={styles.separator}>
      <Divider inset={0} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  contentWide: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  header: { gap: spacing.lg, paddingBottom: spacing.xl },
  titles: { gap: spacing.xs },
  separator: { paddingVertical: spacing.xl },
  none: { paddingVertical: spacing.lg },
});
