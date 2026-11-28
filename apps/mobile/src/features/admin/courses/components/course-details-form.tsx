import { zodResolver } from '@hookform/resolvers/zod';
import { courseFormSchema, MAX_ABOUT_POINTS, type CourseFormValues } from '@mcc/shared';
import type { ReactNode } from 'react';
import { Controller, useForm, useWatch, type Control } from 'react-hook-form';
import { View } from 'react-native';

import { AppText, Button, FormTextField, spacing, SwitchRow } from '@/ui';

import { ErrorNotice } from '../../shared/error-notice';

export interface CourseDetailsFormProps {
  initialValues: CourseFormValues;
  submitLabel: string;
  onSubmit: (values: CourseFormValues) => void;
  saving: boolean;
  error: unknown;
  /** Edit mode: keep Save disabled until something changes. */
  disableUntilChanged?: boolean;
  /**
   * A cover picture block above the save button, for a course that does not exist yet. It is
   * given the name and description typed so far, which is what an AI picture is drawn from.
   */
  renderCover?: (typed: { title: string; description: string }) => ReactNode;
}

/** Follows the two fields the cover needs, so typing elsewhere does not redraw it. */
function CoverSlot({
  control,
  render,
}: {
  control: Control<CourseFormValues>;
  render: NonNullable<CourseDetailsFormProps['renderCover']>;
}) {
  const [title, description] = useWatch({ control, name: ['title', 'shortDescription'] });
  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: 2 }}>
        <AppText variant="label">Cover picture (optional)</AppText>
        <AppText variant="caption" color="textMuted">
          Shown on the course card, cropped to 16:9. You can add or change it later too.
        </AppText>
      </View>
      {render({ title, description })}
    </View>
  );
}

export function CourseDetailsForm({
  initialValues,
  submitLabel,
  onSubmit,
  saving,
  error,
  disableUntilChanged = false,
  renderCover,
}: CourseDetailsFormProps) {
  const { control, handleSubmit, formState } = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: initialValues,
  });

  return (
    <View style={{ gap: spacing.lg }}>
      <FormTextField control={control} name="title" label="Course name" placeholder="ADCA" />
      <FormTextField
        control={control}
        name="shortDescription"
        label="Short description"
        placeholder="Advanced Diploma in Computer Applications"
        multiline
      />
      <FormTextField
        control={control}
        name="durationText"
        label="Duration"
        placeholder="12 months"
      />
      <FormTextField
        control={control}
        name="originalPriceRupees"
        label="Original price in ₹ (shown crossed out)"
        hint="Leave empty to show only “₹0”."
        keyboardType="number-pad"
        placeholder="14999"
      />
      <FormTextField
        control={control}
        name="aboutPointsText"
        label="About this course"
        hint={`One point per line, up to ${MAX_ABOUT_POINTS}. For example: “Free certificate”.`}
        multiline
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
      {renderCover ? <CoverSlot control={control} render={renderCover} /> : null}
      <ErrorNotice error={error} />
      <Button
        label={submitLabel}
        loading={saving}
        disabled={disableUntilChanged && !formState.isDirty}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}
