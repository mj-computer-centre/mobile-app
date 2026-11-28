import type { AnswerSheet, MyTest, TestAttempt } from '@mcc/shared';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  fetchAttemptReview,
  fetchAttemptSummary,
  fetchMyTests,
  fetchPaper,
  saveAnswers,
  startTest,
  submitTest,
  type AnswerChanges,
  type MyTestsResult,
} from './api';

/**
 * Query keys for a student's tests. They start with 'tests', not 'catalog': attempts and scores
 * are personal, so they are never written to the on-device cache (lib/query-persister.ts).
 */
export const testsKeys = {
  all: ['tests'] as const,
  mine: ['tests', 'mine'] as const,
  paper: (testId: string, attemptId: string) => ['tests', 'paper', testId, attemptId] as const,
  summary: (attemptId: string) => ['tests', 'summary', attemptId] as const,
  review: (attemptId: string) => ['tests', 'review', attemptId] as const,
};

/** The list of tests with the caller's attempts, and the server clock offset. */
export function useMyTests() {
  return useQuery({ queryKey: testsKeys.mine, queryFn: fetchMyTests, staleTime: 30_000 });
}

/** One test from the list. `test` is undefined while loading and null when it is not there. */
export function useMyTest(testId: string) {
  const query = useMyTests();
  const test: MyTest | null | undefined = query.data
    ? (query.data.tests.find((item) => item.id === testId) ?? null)
    : undefined;
  return { ...query, test, clockOffsetMs: query.data?.clockOffsetMs ?? 0 };
}

/**
 * Puts an attempt the server just returned into the cached list of tests. The list is fetched
 * again straight after, but on a poor connection that can fail; without this the screens would
 * go on showing a test as not started (or not submitted) when the server says otherwise.
 */
function rememberAttempt(queryClient: QueryClient, attempt: TestAttempt): void {
  queryClient.setQueryData<MyTestsResult>(testsKeys.mine, (current) =>
    current
      ? {
          ...current,
          tests: current.tests.map((test) =>
            test.id === attempt.testId ? { ...test, attempt } : test,
          ),
        }
      : current,
  );
}

export function useStartTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startTest,
    onSuccess: (attempt) => {
      rememberAttempt(queryClient, attempt);
      // Not awaited: the cache already has what the screens need, so they move on at once.
      void queryClient.invalidateQueries({ queryKey: testsKeys.all });
    },
  });
}

/**
 * The questions and saved answers of an attempt. Fetched once per visit and never refetched
 * behind the student's back, so an answer they just tapped is not replaced by an older copy.
 */
export function usePaper(testId: string, attemptId: string | undefined) {
  return useQuery({
    queryKey: testsKeys.paper(testId, attemptId ?? 'none'),
    queryFn: () => fetchPaper(testId, attemptId as string),
    enabled: Boolean(attemptId),
    staleTime: Infinity,
    gcTime: 0,
  });
}

/** Saves answers while the test runs. Failures are retried by the screen, not by the query. */
export function useSaveAnswers(attemptId: string | undefined) {
  return useMutation({
    mutationFn: (changes: AnswerChanges) => {
      if (!attemptId) throw new Error('useSaveAnswers called without an attempt');
      return saveAnswers(attemptId, changes);
    },
  });
}

export function useSubmitTest(attemptId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answers: AnswerSheet) => {
      if (!attemptId) throw new Error('useSubmitTest called without an attempt');
      return submitTest(attemptId, answers);
    },
    onSuccess: (attempt) => {
      rememberAttempt(queryClient, attempt);
      // Not awaited: the cache already has what the screens need, so they move on at once.
      void queryClient.invalidateQueries({ queryKey: testsKeys.all });
    },
  });
}

export function useAttemptSummary(attemptId: string | undefined) {
  return useQuery({
    queryKey: testsKeys.summary(attemptId ?? 'none'),
    queryFn: () => fetchAttemptSummary(attemptId as string),
    enabled: Boolean(attemptId),
  });
}

export function useAttemptReview(attemptId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: testsKeys.review(attemptId ?? 'none'),
    queryFn: () => fetchAttemptReview(attemptId as string),
    enabled: Boolean(attemptId) && enabled,
  });
}

/**
 * The server's time, ticking. Screens that show "starts in…" pass a slow tick; the screen with
 * the running clock passes one second.
 */
export function useServerNow(clockOffsetMs: number, everyMs = 30_000): number {
  // The device's time is what ticks; the offset is added while rendering, so a newly measured
  // offset applies at once instead of at the next tick.
  const [deviceNow, setDeviceNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setDeviceNow(Date.now()), everyMs);
    return () => clearInterval(timer);
  }, [everyMs]);
  return deviceNow + clockOffsetMs;
}
