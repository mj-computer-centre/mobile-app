import type { AnswerSheet, TestQuestion } from '@mcc/shared';
import { StyleSheet, View } from 'react-native';

import { KeyCap, radius, spacing, useTheme } from '@/ui';

const KEY_SIZE = 40;

/**
 * Every question of a test as a numbered key. An answered question's key is pressed in and
 * blue; the one on screen has a marigold ring. Pressing a key jumps to that question.
 */
export function QuestionGrid({
  questions,
  answers,
  current,
  onJump,
}: {
  questions: readonly TestQuestion[];
  answers: AnswerSheet;
  /** Place of the question on screen, counted from 0. */
  current: number;
  onJump: (index: number) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.grid}>
      {questions.map((question, index) => {
        const answered = answers[question.id] !== undefined;
        const onScreen = index === current;
        return (
          <View
            key={question.id}
            style={[styles.cell, { borderColor: onScreen ? colors.accent : 'transparent' }]}>
            <KeyCap
              legend={String(index + 1)}
              size={KEY_SIZE}
              tone={answered ? 'primary' : 'neutral'}
              latched={answered}
              accessibilityLabel={`Question ${index + 1}, ${answered ? 'answered' : 'not answered'}${onScreen ? ', on screen now' : ''}`}
              onPress={() => onJump(index)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  // The ring is always there, only its colour changes, so keys do not shift when it moves.
  cell: { padding: 2, borderWidth: 2, borderRadius: radius.md + 4 },
});
