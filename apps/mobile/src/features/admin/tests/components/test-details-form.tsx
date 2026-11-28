import { zodResolver } from '@hookform/resolvers/zod';
import { testFormSchema, toAppError, type TestFormValues } from '@mcc/shared';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { useCourses } from '@/features/catalog';
import {
  AppText,
  Button,
  DateTimeField,
  FormTextField,
  Icon,
  radius,
  spacing,
  SwitchRow,
  useTheme,
} from '@/ui';

import { PickFromListModal } from '../../shared/pick-from-list-modal';

export interface TestDetailsFormProps {
  initialValues: TestFormValues;
  submitLabel: string;
  onSubmit: (values: TestFormValues) => void;
  saving: boolean;
  error: unknown;
  /** Edit mode: keep Save disabled until something changes. */
  disableUntilChanged?: boolean;
}

/** What a test is and when it runs. Its questions are edited separately, once it exists. */
export function TestDetailsForm({
  initialValues,
  submitLabel,
  onSubmit,
  saving,
  error,
  disableUntilChanged = false,
}: TestDetailsFormProps) {
  const { colors } = useTheme();
  const courses = useCourses({ includeDrafts: true });
  const [pickingCourse, setPickingCourse] = useState(false);
  const { control, handleSubmit, formState, setValue } = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: initialValues,
  });
  const courseId = useWatch({ control, name: 'courseId' });
  const course = courses.data?.find((item) => item.id === courseId);
  const setCourse = (id: string) =>
    setValue('courseId', id, { shouldDirty: true, shouldTouch: true });

  return (
    <View style={styles.form}>
      <FormTextField
        control={control}
        name="title"
        label="Test name"
        placeholder="MS Word unit test"
      />
      <FormTextField
        control={control}
        name="description"
        label="Instructions (optional)"
        hint="Students read this before they start."
        placeholder="Read each question carefully. There is one right answer to each."
        multiline
      />

      <View style={styles.field}>
        <AppText variant="label">Course (optional)</AppText>
        <View
          style={[
            styles.courseBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <Icon name="book-open-page-variant-outline" size={20} color="textMuted" />
          <AppText style={styles.grow} color={courseId ? 'text' : 'textFaint'} numberOfLines={1}>
            {courseId ? (course?.title ?? 'A course') : 'Not linked to a course'}
          </AppText>
        </View>
        <View style={styles.courseActions}>
          <Button
            label={courseId ? 'Change' : 'Choose a course'}
            variant="secondary"
            compact
            onPress={() => setPickingCourse(true)}
          />
          {courseId ? (
            <Button label="Remove" variant="ghost" compact onPress={() => setCourse('')} />
          ) : null}
        </View>
        <AppText variant="caption" color="textMuted">
          A test linked to a course also appears on that course’s page.
        </AppText>
      </View>

      <View style={styles.pair}>
        <View style={styles.half}>
          <Controller
            control={control}
            name="startsAt"
            render={({ field, fieldState }) => (
              <DateTimeField
                label="Opens"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </View>
        <View style={styles.half}>
          <Controller
            control={control}
            name="endsAt"
            render={({ field, fieldState }) => (
              <DateTimeField
                label="Closes"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </View>
      </View>
      <AppText variant="caption" color="textMuted">
        Students can start any time between these two. Each student gets the minutes below, or until
        the closing time if that comes first.
      </AppText>

      <View style={styles.pair}>
        <View style={styles.half}>
          <FormTextField
            control={control}
            name="durationMinutes"
            label="Minutes students get"
            keyboardType="number-pad"
            placeholder="30"
          />
        </View>
        <View style={styles.half}>
          <FormTextField
            control={control}
            name="passPercent"
            label="Pass mark % (optional)"
            hint="Leave empty if the test has no pass mark."
            keyboardType="number-pad"
            placeholder="40"
          />
        </View>
      </View>

      <Controller
        control={control}
        name="allowLate"
        render={({ field }) => (
          <SwitchRow
            label="Let students who missed it take it later"
            description="Their test is marked as taken late. You can switch this on after the test has ended."
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="showReview"
        render={({ field }) => (
          <SwitchRow
            label="Show students the correct answers after the test closes"
            description="Off keeps the answers hidden. Students still see their score."
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="isPublished"
        render={({ field }) => (
          <SwitchRow
            label="Show to students"
            description="Off keeps it as a draft that only staff can see."
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />

      {error ? (
        <AppText color="danger" accessibilityLiveRegion="polite">
          {toAppError(error).message}
        </AppText>
      ) : null}
      <Button
        label={submitLabel}
        loading={saving}
        disabled={disableUntilChanged && !formState.isDirty}
        onPress={handleSubmit(onSubmit)}
      />

      <PickFromListModal
        visible={pickingCourse}
        title="Which course is this test for?"
        items={courses.data?.map((item) => ({
          id: item.id,
          title: item.title,
          ...(item.isPublished ? {} : { subtitle: 'Draft' }),
        }))}
        emptyMessage="No courses yet."
        onPick={setCourse}
        onClose={() => setPickingCourse(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  field: { gap: spacing.xs + 2 },
  grow: { flex: 1 },
  courseBox: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  courseActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  // Two fields side by side where there is room; one under the other on a phone.
  pair: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  half: { flexGrow: 1, flexBasis: 240, minWidth: 0 },
});
