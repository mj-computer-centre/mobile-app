import type { TestQuestion } from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { AppText, spacing } from '@/ui';

import { OptionKey } from './option-key';

/**
 * One question of a running test with its answers as keys. Pressing a key chooses that answer
 * and the key stays down; pressing it again lets go, leaving the question unanswered.
 */
export function QuestionView({
  question,
  number,
  selected,
  onChoose,
  locked = false,
}: {
  question: TestQuestion;
  /** The question's place in the test, counted from 1. */
  number: number;
  selected: number | undefined;
  /** Called with the chosen option, or null when the chosen one is let go. */
  onChoose: (option: number | null) => void;
  /** While the test is being submitted the answers can no longer change. */
  locked?: boolean;
}) {
  return (
    <View style={styles.question}>
      <AppText variant="tag" color="textMuted">
        {question.marks} mark{question.marks === 1 ? '' : 's'}
      </AppText>
      <AppText variant="subheading" accessibilityRole="header" style={styles.prompt}>
        {question.prompt}
      </AppText>
      <View
        style={styles.options}
        accessibilityRole="radiogroup"
        accessibilityLabel={`Answers to question ${number}`}>
        {question.options.map((option, index) => (
          <OptionKey
            key={index}
            index={index}
            text={option}
            state={selected === index ? 'chosen' : 'idle'}
            onPress={locked ? undefined : () => onChoose(selected === index ? null : index)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  question: { gap: spacing.md },
  // Questions run to several lines; they get more air than a heading would.
  prompt: { fontSize: 18, lineHeight: 26 },
  options: { gap: spacing.sm, marginTop: spacing.xs },
});
