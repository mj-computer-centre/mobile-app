import {
  EMPTY_QUESTION_FORM,
  MAX_OPTIONS,
  MIN_OPTIONS,
  questionFormSchema,
  questionToForm,
  toAppError,
  type QuestionFormValues,
  type TestQuestionWithKey,
} from '@mcc/shared';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { optionLetter } from '@/features/tests';
import {
  AppText,
  Button,
  IconButton,
  KeyCap,
  radius,
  Sheet,
  spacing,
  TextField,
  typography,
  useTheme,
} from '@/ui';

import { useQuestionActions } from '../hooks';

export interface QuestionSheetProps {
  testId: string;
  /** The question being edited, 'new' to add one, or null while the sheet is closed. */
  target: TestQuestionWithKey | 'new' | null;
  /** The place the question has, or will get, in the test (counted from 1). */
  number: number;
  onClose: () => void;
}

/** Add or change one question: its text, its options, which option is right, and its marks. */
export function QuestionSheet({ testId, target, number, onClose }: QuestionSheetProps) {
  if (!target) return null;
  // Keyed so the fields start from this question each time the sheet opens.
  return (
    <QuestionForm
      key={target === 'new' ? 'new' : target.id}
      testId={testId}
      target={target}
      number={number}
      onClose={onClose}
    />
  );
}

// A browser's multi-line box starts two rows tall; an option is usually a few words. On a phone
// the field grows with the text by itself, and fixing its rows there would stop that.
const WEB_ONE_ROW = Platform.OS === 'web' ? { rows: 1 } : null;

/** A fresh copy each time, so one question's options never leak into the next. */
function emptyForm(): QuestionFormValues {
  return { ...EMPTY_QUESTION_FORM, options: [...EMPTY_QUESTION_FORM.options] };
}

function QuestionForm({
  testId,
  target,
  number,
  onClose,
}: {
  testId: string;
  target: TestQuestionWithKey | 'new';
  number: number;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { save } = useQuestionActions(testId);
  const isNew = target === 'new';
  const [values, setValues] = useState<QuestionFormValues>(() =>
    target === 'new' ? emptyForm() : questionToForm(target),
  );
  // Validation messages by field: "prompt", "options", "options.2", "marks", "explanation".
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (key: string) =>
    setErrors((current) => {
      if (!(key in current)) return current;
      const { [key]: _removed, ...rest } = current;
      return rest;
    });
  const setOption = (index: number, text: string) => {
    setValues((current) => ({
      ...current,
      options: current.options.map((option, place) => (place === index ? text : option)),
    }));
    clearError(`options.${index}`);
  };
  const removeOption = (index: number) => {
    setValues((current) => ({
      ...current,
      options: current.options.filter((_, place) => place !== index),
      // Keep pointing at the same answer; if the answer itself went, fall back to the first.
      correctOption:
        index === current.correctOption
          ? 0
          : index < current.correctOption
            ? current.correctOption - 1
            : current.correctOption,
    }));
    // Messages are stored by position, and every position after this one has just moved.
    setErrors({});
  };

  const submit = (afterSave: 'close' | 'another') => {
    const parsed = questionFormSchema.safeParse(values);
    if (!parsed.success) {
      const found: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.map(String).join('.');
        if (!(key in found)) found[key] = issue.message;
      }
      setErrors(found);
      return;
    }
    setErrors({});
    save.mutate(
      { questionId: target === 'new' ? null : target.id, values: parsed.data },
      {
        onSuccess: () => {
          if (afterSave === 'close') onClose();
          else setValues(emptyForm());
        },
      },
    );
  };

  return (
    <Sheet
      visible
      tall
      onClose={onClose}
      title={isNew ? `Question ${number}` : `Edit question ${number}`}
      closeLabel="Cancel">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <TextField
          label="Question"
          placeholder="What is the full form of CPU?"
          multiline
          value={values.prompt}
          onChangeText={(prompt) => {
            setValues((current) => ({ ...current, prompt }));
            clearError('prompt');
          }}
          error={errors.prompt}
        />

        <View style={styles.options} accessibilityRole="radiogroup">
          <View style={styles.optionsHeading}>
            <AppText variant="label">Options</AppText>
            <AppText variant="caption" color="textMuted">
              Press a letter to mark the correct answer. It turns green.
            </AppText>
          </View>
          {values.options.map((option, index) => {
            const letter = optionLetter(index);
            const correct = index === values.correctOption;
            const optionError = errors[`options.${index}`];
            return (
              <View key={index} style={styles.option}>
                <View style={styles.optionRow}>
                  <KeyCap
                    legend={letter}
                    size={46}
                    tone={correct ? 'success' : 'neutral'}
                    latched={correct}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: correct, checked: correct }}
                    accessibilityLabel={
                      correct
                        ? `Option ${letter}, the correct answer`
                        : `Mark option ${letter} as the correct answer`
                    }
                    onPress={() => {
                      setValues((current) => ({ ...current, correctOption: index }));
                      clearError('correctOption');
                    }}
                  />
                  <TextInput
                    accessibilityLabel={`Option ${letter}`}
                    placeholder={`Option ${letter}`}
                    placeholderTextColor={colors.textFaint}
                    multiline
                    {...WEB_ONE_ROW}
                    value={option}
                    onChangeText={(text) => setOption(index, text)}
                    style={[
                      styles.optionInput,
                      typography.body,
                      {
                        color: colors.text,
                        backgroundColor: colors.surface,
                        borderColor: optionError ? colors.danger : colors.border,
                        // The browser's own focus ring would double the border.
                        outlineWidth: 0,
                      },
                    ]}
                  />
                  {values.options.length > MIN_OPTIONS ? (
                    <IconButton
                      icon="close"
                      label={`Remove option ${letter}`}
                      onPress={() => removeOption(index)}
                    />
                  ) : null}
                </View>
                {optionError ? (
                  <AppText variant="caption" color="danger" style={styles.optionError}>
                    {optionError}
                  </AppText>
                ) : null}
              </View>
            );
          })}
          {(errors.options ?? errors.correctOption) ? (
            <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">
              {errors.options ?? errors.correctOption}
            </AppText>
          ) : null}
          {values.options.length < MAX_OPTIONS ? (
            <Button
              label="Add an option"
              icon="plus"
              variant="secondary"
              compact
              onPress={() =>
                setValues((current) => ({ ...current, options: [...current.options, ''] }))
              }
              style={styles.addOption}
            />
          ) : null}
        </View>

        <TextField
          label="Marks"
          keyboardType="number-pad"
          value={values.marks}
          onChangeText={(marks) => {
            setValues((current) => ({ ...current, marks }));
            clearError('marks');
          }}
          error={errors.marks}
        />
        <TextField
          label="Explanation (optional)"
          hint="Shown with the correct answer when students check their test."
          multiline
          value={values.explanation}
          onChangeText={(explanation) => {
            setValues((current) => ({ ...current, explanation }));
            clearError('explanation');
          }}
          error={errors.explanation}
        />

        {save.isError ? (
          <AppText color="danger" accessibilityLiveRegion="polite">
            {toAppError(save.error).message}
          </AppText>
        ) : null}
        <Button
          label={isNew ? 'Add question' : 'Save question'}
          loading={save.isPending}
          onPress={() => submit('close')}
        />
        {isNew ? (
          <Button
            label="Add and write another"
            variant="secondary"
            disabled={save.isPending}
            onPress={() => submit('another')}
          />
        ) : null}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: spacing.lg, paddingBottom: spacing.xl },
  options: { gap: spacing.md },
  optionsHeading: { gap: 2 },
  option: { gap: spacing.xs },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  optionInput: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  // Lines up under the text field, past the letter key.
  optionError: { marginLeft: 46 + spacing.sm },
  addOption: { alignSelf: 'flex-start' },
});
