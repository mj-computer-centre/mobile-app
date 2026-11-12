import { zodResolver } from '@hookform/resolvers/zod';
import { sectionFormSchema, toAppError, type SectionFormValues } from '@mcc/shared';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { AppText, Button, FormTextField, spacing } from '@/ui';

import { useUpdateSection } from '../hooks';

export function SectionDetailsForm({
  sectionId,
  initialValues,
}: {
  sectionId: string;
  initialValues: SectionFormValues;
}) {
  const update = useUpdateSection(sectionId);
  const { control, handleSubmit, formState, reset } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: initialValues,
  });

  return (
    <View style={{ gap: spacing.lg }}>
      <FormTextField control={control} name="title" label="Unit name" placeholder="MS Word" />
      <FormTextField
        control={control}
        name="description"
        label="Description (optional)"
        multiline
      />
      {update.isError ? <AppText color="danger">{toAppError(update.error).message}</AppText> : null}
      <Button
        label="Save changes"
        loading={update.isPending}
        disabled={!formState.isDirty}
        onPress={handleSubmit((values) =>
          update.mutate(values, { onSuccess: () => reset(values) }),
        )}
      />
    </View>
  );
}
