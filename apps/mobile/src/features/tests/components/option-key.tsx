import { StyleSheet, Text, View } from 'react-native';

import { AppText, fonts, Key, keyDepth, radius, spacing, useTheme } from '@/ui';

/** "A", "B", "C"… for the options of a question. */
export function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

export type OptionState = 'idle' | 'chosen' | 'correct' | 'wrong';

/**
 * One answer to a question, as a key with its letter. Pressing it chooses the answer and the
 * key stays down; pressing it again lets go. In a review the same key shows what was right
 * (green) and what the student chose wrongly (red), and cannot be pressed.
 */
export function OptionKey({
  index,
  text,
  state = 'idle',
  onPress,
  note,
}: {
  index: number;
  text: string;
  state?: OptionState;
  onPress?: (() => void) | undefined;
  /** A few words under the option in a review: "Your answer", "Correct answer". */
  note?: string | undefined;
}) {
  const { colors } = useTheme();
  const letter = optionLetter(index);
  const tone =
    state === 'chosen'
      ? 'primary'
      : state === 'correct'
        ? 'success'
        : state === 'wrong'
          ? 'danger'
          : 'neutral';
  const ink = state === 'idle' ? colors.text : colors.onPrimary;
  // The letter sits on a small tile so it reads as the key's legend, apart from the answer.
  const tile = state === 'idle' ? colors.surfaceMuted : 'rgba(255, 255, 255, 0.2)';

  return (
    <Key
      tone={tone}
      depth={keyDepth.md}
      cornerRadius={radius.md}
      latched={state !== 'idle'}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={`${letter}. ${text}${note ? `. ${note}` : ''}`}
      accessibilityState={{ selected: state === 'chosen', checked: state === 'chosen' }}
      faceStyle={styles.face}>
      <View style={[styles.letter, { backgroundColor: tile }]}>
        <Text style={[styles.letterText, { color: ink }]}>{letter}</Text>
      </View>
      <View style={styles.text}>
        <AppText style={{ color: ink }}>{text}</AppText>
        {note ? (
          <AppText variant="tag" style={{ color: ink }}>
            {note}
          </AppText>
        ) : null}
      </View>
    </Key>
  );
}

const styles = StyleSheet.create({
  face: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  letter: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontFamily: fonts.display,
    fontSize: 17,
    lineHeight: 21,
    includeFontPadding: false,
  },
  text: { flex: 1, gap: 2 },
});
