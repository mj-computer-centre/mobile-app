import type {
  AdminTest,
  ImportedQuestion,
  QuestionFormValues,
  TestFormValues,
  TestResult,
} from '@mcc/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useUserId } from '@/features/auth';
import { testsKeys } from '@/features/tests';

import { adminKeys } from '../shared/keys';
import {
  createTest,
  deleteQuestion,
  deleteTest,
  exportResultsCsv,
  fetchAdminTests,
  fetchTestQuestions,
  fetchTestRecord,
  fetchTestResults,
  importQuestions,
  reorderQuestions,
  resetAttempt,
  saveQuestion,
  setTestFlags,
  updateTest,
} from './api';

/**
 * After any change to a test, refresh what staff see and what students see, so an edit shows up
 * in the Tests tab of the same device straight away.
 */
function useRefreshTests(): () => Promise<void> {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminKeys.all }),
      queryClient.invalidateQueries({ queryKey: testsKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['site'] }),
    ]);
  };
}

export function useAdminTests() {
  return useQuery({ queryKey: adminKeys.tests, queryFn: fetchAdminTests });
}

/** One test from the admin list, with its counts. Undefined while loading, null when gone. */
export function useAdminTest(testId: string) {
  const query = useAdminTests();
  const test: AdminTest | null | undefined = query.data
    ? (query.data.find((item) => item.id === testId) ?? null)
    : undefined;
  return { ...query, test };
}

export function useTestRecord(testId: string) {
  return useQuery({ queryKey: adminKeys.test(testId), queryFn: () => fetchTestRecord(testId) });
}

export function useCreateTest() {
  const userId = useUserId();
  const refresh = useRefreshTests();
  return useMutation({
    mutationFn: (values: TestFormValues) => createTest(values, userId),
    onSuccess: refresh,
  });
}

export function useUpdateTest(testId: string) {
  const refresh = useRefreshTests();
  return useMutation({
    mutationFn: (values: TestFormValues) => updateTest(testId, values),
    onSuccess: refresh,
  });
}

export function useSetTestFlags(testId: string) {
  const refresh = useRefreshTests();
  return useMutation({
    mutationFn: (flags: { isPublished?: boolean; allowLate?: boolean }) =>
      setTestFlags(testId, flags),
    onSuccess: refresh,
  });
}

export function useDeleteTest() {
  const refresh = useRefreshTests();
  return useMutation({ mutationFn: deleteTest, onSuccess: refresh });
}

export function useTestQuestions(testId: string) {
  return useQuery({
    queryKey: adminKeys.testQuestions(testId),
    queryFn: () => fetchTestQuestions(testId),
  });
}

/** Adding, changing, removing, reordering and importing the questions of one test. */
export function useQuestionActions(testId: string) {
  const refresh = useRefreshTests();
  return {
    save: useMutation({
      mutationFn: ({
        questionId,
        values,
      }: {
        questionId: string | null;
        values: QuestionFormValues;
      }) => saveQuestion(testId, questionId, values),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: deleteQuestion, onSuccess: refresh }),
    reorder: useMutation({
      mutationFn: (questionIds: string[]) => reorderQuestions(testId, questionIds),
      onSuccess: refresh,
    }),
    importMany: useMutation({
      mutationFn: (questions: ImportedQuestion[]) => importQuestions(testId, questions),
      onSuccess: refresh,
    }),
  };
}

export function useTestResults(testId: string) {
  return useQuery({
    queryKey: adminKeys.testResults(testId),
    queryFn: () => fetchTestResults(testId),
  });
}

export function useResetAttempt() {
  const refresh = useRefreshTests();
  return useMutation({ mutationFn: resetAttempt, onSuccess: refresh });
}

export function useExportResults() {
  return useMutation({
    mutationFn: ({
      test,
      results,
    }: {
      test: Pick<AdminTest, 'title' | 'totalMarks'>;
      results: TestResult[];
    }) => exportResultsCsv(test, results),
  });
}
