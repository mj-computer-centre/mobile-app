import { router } from 'expo-router';
import { useEffect } from 'react';

import { routes } from '@/lib/routes';
import { EmptyState, ErrorState, LoadingState } from '@/ui';

import { TestRunner } from '../components/test-runner';
import { useMyTest, usePaper } from '../hooks';

/** Back to the test's own page: the page under this screen when there is one, else in its place. */
function leaveToTest(testId: string): void {
  router.dismissTo(routes.test(testId));
}

/**
 * Shown for a moment while leaving. Used instead of a redirect so the test's page is not put
 * on the stack a second time: after submitting, Back must not lead to another copy of it.
 */
function LeaveToTest({ testId }: { testId: string }) {
  useEffect(() => {
    leaveToTest(testId);
  }, [testId]);
  return <LoadingState />;
}

/**
 * Answering a test. This screen only decides whether there is something to answer: the test
 * must exist and the student must have an attempt that is not submitted. Starting an attempt
 * happens on the test's page, never by opening this address. Time running out is handled by
 * the runner, which submits the answers before leaving.
 */
export function TakeTestScreen({ testId }: { testId: string }) {
  const { test, clockOffsetMs, isError, error, refetch } = useMyTest(testId);
  const attempt = test?.attempt ?? null;
  const running = attempt !== null && attempt.submittedAt === null;
  const paper = usePaper(testId, running ? attempt.id : undefined);

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
  if (!attempt || !running) return <LeaveToTest testId={testId} />;
  if (paper.isPending) return <LoadingState label="Loading the questions…" />;
  if (paper.isError) {
    return <ErrorState error={paper.error} onRetry={() => void paper.refetch()} />;
  }

  return (
    // Keyed by attempt: if staff reset the attempt and the student starts again, the answers
    // on screen start again too.
    <TestRunner
      key={attempt.id}
      test={test}
      attempt={attempt}
      paper={paper.data}
      clockOffsetMs={clockOffsetMs}
      onLeave={() => leaveToTest(testId)}
    />
  );
}
