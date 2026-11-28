import {
  IMPORT_EXAMPLE,
  parseQuestionsText,
  questionFormSchema,
  toAppError,
  type ImportedQuestion,
} from '@mcc/shared';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Button, Notice, radius, Sheet, spacing, TextField, useTheme } from '@/ui';

import { useQuestionActions } from '../hooks';

/** More problems than this are counted, not listed: fixing the first few usually fixes the rest. */
const MAX_PROBLEMS_SHOWN = 8;

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/**
 * Problems the reader of the pasted text cannot see: a question or option that is too long to
 * save. Checked with the same rules as the question form, and named by the question's first
 * words, since a question that was read correctly has no number of its own any more.
 */
function tooLongProblems(questions: ImportedQuestion[]): string[] {
  return questions.flatMap((question) => {
    const check = questionFormSchema.safeParse({ ...question, marks: String(question.marks) });
    if (check.success) return [];
    const start =
      question.prompt.length > 40 ? `${question.prompt.slice(0, 40)}…` : question.prompt;
    return [`“${start}”: ${check.error.issues[0]?.message ?? 'Check this question.'}`];
  });
}

/**
 * Add a whole paper at once: paste questions typed the way teachers already write them, see
 * straight away what was understood, and add them all in one go.
 */
export function ImportQuestionsSheet({
  testId,
  visible,
  onClose,
}: {
  testId: string;
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible) return null;
  // Mounted only while open, so the box is empty each time.
  return <ImportForm testId={testId} onClose={onClose} />;
}

function ImportForm({ testId, onClose }: { testId: string; onClose: () => void }) {
  const { colors } = useTheme();
  const { importMany } = useQuestionActions(testId);
  const [text, setText] = useState('');
  const { questions, problems: formatProblems } = parseQuestionsText(text);
  const problems = [
    ...formatProblems.map((problem) => `Question ${problem.question}: ${problem.message}`),
    ...tooLongProblems(questions),
  ];
  const ready = questions.length;
  const canAdd = ready > 0 && problems.length === 0;

  return (
    <Sheet visible tall onClose={onClose} title="Paste many questions" closeLabel="Cancel">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <AppText color="textMuted">
          Type or paste your questions like the example. Put a star after the right option, or write
          “Answer: B” under the options.
        </AppText>
        <View
          style={[styles.example, { backgroundColor: colors.surfaceMuted }]}
          accessible
          accessibilityLabel={`Example. ${IMPORT_EXAMPLE}`}>
          <AppText variant="caption">{IMPORT_EXAMPLE}</AppText>
        </View>

        <TextField
          label="Your questions"
          placeholder="1. …"
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          value={text}
          onChangeText={setText}
        />

        {text.trim() === '' ? null : canAdd ? (
          <Notice tone="success">{`${plural(ready, 'question')} ready to add.`}</Notice>
        ) : problems.length === 0 ? (
          <Notice tone="warning">
            No questions found yet. Start each question with its number, like “1.”, and each option
            with its letter, like “A)”.
          </Notice>
        ) : (
          <View style={styles.problems} accessibilityLiveRegion="polite">
            <AppText variant="bodyStrong">
              {ready > 0
                ? `${plural(ready, 'question')} ready. Fix ${plural(problems.length, 'problem')} to add them all:`
                : `Fix ${plural(problems.length, 'problem')} to add your questions:`}
            </AppText>
            {problems.slice(0, MAX_PROBLEMS_SHOWN).map((problem) => (
              <Notice key={problem} tone="danger">
                {problem}
              </Notice>
            ))}
            {problems.length > MAX_PROBLEMS_SHOWN ? (
              <AppText variant="caption" color="textMuted">
                And {problems.length - MAX_PROBLEMS_SHOWN} more.
              </AppText>
            ) : null}
          </View>
        )}

        {importMany.isError ? (
          <AppText color="danger" accessibilityLiveRegion="polite">
            {toAppError(importMany.error).message}
          </AppText>
        ) : null}
        <Button
          label={canAdd ? `Add ${plural(ready, 'question')}` : 'Add questions'}
          icon="plus"
          disabled={!canAdd}
          loading={importMany.isPending}
          onPress={() => importMany.mutate(questions, { onSuccess: onClose })}
        />
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: spacing.lg, paddingBottom: spacing.xl },
  example: { borderRadius: radius.md, padding: spacing.md },
  problems: { gap: spacing.sm },
});
