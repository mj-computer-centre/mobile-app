import { zodResolver } from '@hookform/resolvers/zod';
import { completeProfileSchema, toAppError, type CompleteProfileValues } from '@mcc/shared';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { useCourseOptions } from '@/features/catalog';
import { AppText, Button, FormTextField, spacing } from '@/ui';

import { useSaveProfile } from '../hooks';
import { CoursePicker } from './course-picker';

export interface ProfileFormProps {
  initialValues: CompleteProfileValues;
  submitLabel: string;
  /** The first-time form ends in the screen's main action; editing later is an ordinary save. */
  emphasis?: 'accent' | 'primary';
  onSaved?: () => void;
}

export function ProfileForm({
  initialValues,
  submitLabel,
  emphasis = 'primary',
  onSaved,
}: ProfileFormProps) {
  const courses = useCourseOptions();
  const save = useSaveProfile();
  const { control, handleSubmit } = useForm<CompleteProfileValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: initialValues,
  });

  const onSubmit = handleSubmit((values) => save.mutate(values, { onSuccess: () => onSaved?.() }));
  const options = courses.data ?? [];

  return (
    <View style={{ gap: spacing.lg }}>
      <FormTextField
        control={control}
        name="fullName"
        label="Your name"
        autoComplete="name"
        textContentType="name"
      />
      <FormTextField
        control={control}
        name="phone"
        label="Mobile number"
        hint="The centre may call you about courses and admissions."
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        placeholder="98765 43210"
      />
      <FormTextField
        control={control}
        name="city"
        label="Village or town (optional)"
        autoComplete="postal-address-locality"
      />

      {options.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <AppText variant="label">Which course are you interested in? (optional)</AppText>
          <Controller
            control={control}
            name="interestedCourseId"
            render={({ field }) => (
              <CoursePicker options={options} value={field.value} onChange={field.onChange} />
            )}
          />
        </View>
      ) : null}

      {save.isError ? (
        <AppText color="danger" accessibilityLiveRegion="polite">
          {toAppError(save.error).message}
        </AppText>
      ) : null}
      <Button label={submitLabel} variant={emphasis} loading={save.isPending} onPress={onSubmit} />
    </View>
  );
}
