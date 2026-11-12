import { zodResolver } from '@hookform/resolvers/zod';
import { courseFormSchema, MAX_ABOUT_POINTS, toAppError, type CourseFormValues } from '@mcc/shared';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { AppText, Button, FormTextField, spacing, SwitchRow } from '@/ui';

export interface CourseDetailsFormProps {
  initialValues: CourseFormValues;
  submitLabel: string;
  onSubmit: (values: CourseFormValues) => void;
  saving: boolean;
  error: unknown;
  /** Edit mode: keep Save disabled until something changes. */
  disableUntilChanged?: boolean;
}

export function CourseDetailsForm({
  initialValues,
  submitLabel,
  onSubmit,
  saving,
  error,
  disableUntilChanged = false,
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
    </View>
  );
}
