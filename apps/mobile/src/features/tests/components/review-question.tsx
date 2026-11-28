import type { ReviewQuestion } from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { AppText, Badge, Notice, spacing } from '@/ui';

import { OptionKey, type OptionState } from './option-key';

/**
 * One question after the test is over: what was asked, what the student chose, and the right
 * answer with the centre's explanation when there is one.
 */
export function ReviewQuestionCard({
  question,
  number,
}: {
  question: ReviewQuestion;
  /** The question's place in the test, counted from 1. */
  number: number;
}) {
  const { selectedOption, correctOption } = question;
  const skipped = selectedOption === null;
  const correct = !skipped && selectedOption === correctOption;

  return (
    <View style={styles.question}>
      <View style={styles.header}>
        <AppText variant="tag" color="textMuted" style={styles.grow}>
          Question {number} · {question.marks} mark{question.marks === 1 ? '' : 's'}
        </AppText>
        <Badge
          label={skipped ? 'Not answered' : correct ? 'Correct' : 'Wrong'}
          tone={skipped ? 'neutral' : correct ? 'success' : 'danger'}
          icon={skipped ? 'minus' : correct ? 'check' : 'close'}
        />
      </View>
      <AppText variant="subheading" accessibilityRole="header">
        {question.prompt}
      </AppText>
      <View style={styles.options} accessibilityRole="radiogroup">
        {question.options.map((option, index) => {
          const isCorrect = index === correctOption;
          const isChosen = index === selectedOption;
          const state: OptionState = isCorrect ? 'correct' : isChosen ? 'wrong' : 'idle';
          const note = isCorrect
            ? isChosen
              ? 'Your answer, and it is correct'
              : 'Correct answer'
            : isChosen
              ? 'Your answer'
              : undefined;
          return <OptionKey key={index} index={index} text={option} state={state} note={note} />;
        })}
      </View>
      {question.explanation ? (
        <Notice tone="primary" icon="lightbulb-on-outline">
          {question.explanation}
        </Notice>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  question: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grow: { flex: 1 },
  options: { gap: spacing.sm },
});
