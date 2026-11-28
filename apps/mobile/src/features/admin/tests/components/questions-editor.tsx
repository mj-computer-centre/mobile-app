import { moveItem, toAppError, type TestQuestionWithKey } from '@mcc/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { optionLetter } from '@/features/tests';
import { confirmAction } from '@/lib/platform/confirm';
import { AppText, Button, Divider, ListRow, spacing } from '@/ui';

import { ReorderControls } from '../../shared/reorder-controls';
import { useQuestionActions } from '../hooks';
import { ImportQuestionsSheet } from './import-questions-sheet';
import { QuestionSheet } from './question-sheet';

/** "4 options · answer B · 2 marks": a question at a glance, without opening it. */
function describe(question: TestQuestionWithKey): string {
  return [
    `${question.options.length} options`,
    `answer ${optionLetter(question.correctOption)}`,
    `${question.marks} mark${question.marks === 1 ? '' : 's'}`,
  ].join(' · ');
}

/** The questions of one test, in the order students meet them: add, change, reorder, remove. */
export function QuestionsEditor({
  testId,
  questions,
}: {
  testId: string;
  questions: TestQuestionWithKey[];
}) {
  const { reorder, remove } = useQuestionActions(testId);
  const [editing, setEditing] = useState<TestQuestionWithKey | 'new' | null>(null);
  const [importing, setImporting] = useState(false);
  const busy = reorder.isPending || remove.isPending;
  const error = reorder.error ?? remove.error;
  // A new question goes to the end; an existing one keeps its place.
  const editingNumber =
    editing && editing !== 'new'
      ? questions.findIndex((question) => question.id === editing.id) + 1
      : questions.length + 1;

  const confirmRemove = async (question: TestQuestionWithKey, number: number) => {
    const ok = await confirmAction({
      title: `Delete question ${number}?`,
      message: `“${question.prompt}” is removed from this test. Answers students gave to it are removed too.`,
      confirmLabel: 'Delete question',
      destructive: true,
    });
    if (ok) remove.mutate(question.id);
  };

  return (
    <View>
      {questions.length === 0 ? (
        <AppText color="textMuted" style={styles.padded}>
          No questions yet. Add them one at a time, or paste a whole paper at once.
        </AppText>
      ) : (
        questions.map((question, index) => (
          <View key={question.id}>
            {index > 0 ? <Divider /> : null}
            <ListRow
              title={`${index + 1}. ${question.prompt}`}
              subtitle={describe(question)}
              accessibilityHint="Opens the question to change it"
              onPress={() => setEditing(question)}
              trailing={
                <ReorderControls
                  itemLabel={`question ${index + 1}`}
                  index={index}
                  count={questions.length}
                  disabled={busy}
                  onMove={(from, to) =>
                    reorder.mutate(moveItem(questions, from, to).map((item) => item.id))
                  }
                  onRemove={() => void confirmRemove(question, index + 1)}
                  removeLabel="Delete"
                />
              }
            />
          </View>
        ))
      )}

      {questions.length > 0 ? <Divider inset={0} /> : null}
      <View style={[styles.padded, styles.actions]}>
        <Button label="Add a question" icon="plus" onPress={() => setEditing('new')} />
        <Button
          label="Paste many questions"
          icon="clipboard-text-outline"
          variant="secondary"
          onPress={() => setImporting(true)}
        />
        {error ? (
          <AppText color="danger" accessibilityLiveRegion="polite">
            {toAppError(error).message}
          </AppText>
        ) : null}
      </View>

      <QuestionSheet
        testId={testId}
        target={editing}
        number={editingNumber}
        onClose={() => setEditing(null)}
      />
      <ImportQuestionsSheet
        testId={testId}
        visible={importing}
        onClose={() => setImporting(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  padded: { padding: spacing.lg },
  actions: { gap: spacing.md },
});
