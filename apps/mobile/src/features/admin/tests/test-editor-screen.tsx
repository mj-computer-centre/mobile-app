import { testRowToForm, toAppError } from '@mcc/shared';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { confirmAction, showMessage } from '@/lib/platform/confirm';
import { routes } from '@/lib/routes';
import { Button, ErrorState, LoadingState, Notice, Screen, SkeletonRows, spacing } from '@/ui';

import { AdminSection } from '../shared/admin-section';
import { QuestionsEditor } from './components/questions-editor';
import { TestDetailsForm } from './components/test-details-form';
import { TestStatusNotice } from './components/test-status-notice';
import {
  useAdminTest,
  useDeleteTest,
  useTestQuestions,
  useTestRecord,
  useUpdateTest,
} from './hooks';

export function TestEditorScreen({ testId }: { testId: string }) {
  const record = useTestRecord(testId);
  const summary = useAdminTest(testId);
  const questions = useTestQuestions(testId);
  const update = useUpdateTest(testId);
  const remove = useDeleteTest();
  // Read once when the screen opens; enough to say whether the test is upcoming, open or over.
  const [now] = useState(() => Date.now());

  if (record.isPending) return <LoadingState />;
  if (record.isError)
    return <ErrorState error={record.error} onRetry={() => void record.refetch()} />;
  const test = record.data;
  const attemptCount = summary.test?.attemptCount ?? 0;
  const questionCount = questions.data?.length;
  const totalMarks = questions.data?.reduce((sum, question) => sum + question.marks, 0) ?? 0;

  const confirmDelete = async () => {
    const ok = await confirmAction({
      title: `Delete ${test.title}?`,
      message:
        'Its questions are deleted too, and so are every student’s answers and score for this test. This cannot be undone.',
      confirmLabel: 'Delete test',
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(testId, {
      onSuccess: () => router.replace(routes.admin.tests),
      onError: (error) => showMessage('Could not delete the test', toAppError(error).message),
    });
  };

  return (
    <Screen
      edges={[]}
      refreshing={record.isRefetching}
      onRefresh={() => {
        void record.refetch();
        void summary.refetch();
        void questions.refetch();
      }}>
      <Stack.Screen options={{ title: test.title }} />

      <TestStatusNotice
        test={test}
        questionCount={questionCount}
        now={now}
        action={
          <Button
            label={attemptCount > 0 ? `See results (${attemptCount})` : 'See results'}
            icon="chart-box-outline"
            variant="secondary"
            compact
            onPress={() => router.push(routes.admin.testResults(testId))}
          />
        }
      />
      {attemptCount > 0 ? (
        <Notice tone="warning" title="Students have already taken this test">
          Changing a question’s correct answer re-marks everyone at once. Changing or removing a
          question’s options changes what their saved answers mean, so avoid it.
        </Notice>
      ) : null}

      <AdminSection title="Details">
        <TestDetailsForm
          key={test.updated_at}
          initialValues={testRowToForm(test)}
          submitLabel="Save changes"
          disableUntilChanged
          saving={update.isPending}
          error={update.error}
          onSubmit={(values) => update.mutate(values)}
        />
      </AdminSection>

      <AdminSection
        title="Questions"
        description={
          questionCount
            ? `${questionCount} question${questionCount === 1 ? '' : 's'}, ${totalMarks} mark${totalMarks === 1 ? '' : 's'} in all. Students see them in this order.`
            : 'Each question has two to six options and one right answer.'
        }
        padded={false}>
        {questions.isPending ? (
          <View style={styles.padded}>
            <SkeletonRows />
          </View>
        ) : questions.isError ? (
          <ErrorState error={questions.error} onRetry={() => void questions.refetch()} />
        ) : (
          <QuestionsEditor testId={testId} questions={questions.data} />
        )}
      </AdminSection>

      <Button
        label="Delete test"
        icon="delete-outline"
        variant="danger"
        loading={remove.isPending}
        onPress={() => void confirmDelete()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  padded: { padding: spacing.lg },
});
