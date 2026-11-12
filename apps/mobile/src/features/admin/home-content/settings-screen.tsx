import { zodResolver } from '@hookform/resolvers/zod';
import {
  settingsFormSchema,
  settingsRowToForm,
  toAppError,
  type SettingsFormValues,
} from '@mcc/shared';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { useSettings, type CentreSettings } from '@/features/contact';
import {
  AppText,
  Button,
  Card,
  ErrorState,
  FormTextField,
  LoadingState,
  Screen,
  spacing,
} from '@/ui';

import { useSaveSettings } from './hooks';

export function SettingsScreen() {
  const settings = useSettings();
  if (settings.isPending) return <LoadingState />;
  if (settings.isError)
    return <ErrorState error={settings.error} onRetry={() => void settings.refetch()} />;
  return <SettingsForm key={settings.data.updated_at} settings={settings.data} />;
}

function SettingsForm({ settings }: { settings: CentreSettings }) {
  const save = useSaveSettings();
  const { control, handleSubmit, formState } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settingsRowToForm(settings),
  });

  return (
    <Screen edges={[]}>
      <AppText color="textMuted">Shown on the Contact tab. Leave a field empty to hide it.</AppText>
      <Card>
        <View style={{ gap: spacing.lg }}>
          <FormTextField control={control} name="centreName" label="Centre name" />
          <FormTextField
            control={control}
            name="phone"
            label="Phone number"
            keyboardType="phone-pad"
          />
          <FormTextField
            control={control}
            name="whatsapp"
            label="WhatsApp number"
            keyboardType="phone-pad"
          />
          <FormTextField
            control={control}
            name="email"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormTextField control={control} name="address" label="Address" multiline />
          <FormTextField
            control={control}
            name="mapUrl"
            label="Google Maps link"
            autoCapitalize="none"
            keyboardType="url"
          />
          <FormTextField
            control={control}
            name="timings"
            label="Timings"
            placeholder="Mon–Sat, 8 am – 6 pm"
          />
          <FormTextField
            control={control}
            name="youtubeUrl"
            label="YouTube channel link"
            autoCapitalize="none"
            keyboardType="url"
          />
          <FormTextField
            control={control}
            name="instagramUrl"
            label="Instagram link"
            autoCapitalize="none"
            keyboardType="url"
          />
          <FormTextField
            control={control}
            name="facebookUrl"
            label="Facebook link"
            autoCapitalize="none"
            keyboardType="url"
          />
          {save.isError ? <AppText color="danger">{toAppError(save.error).message}</AppText> : null}
          {save.isSuccess && !formState.isDirty ? <AppText color="success">Saved.</AppText> : null}
          <Button
            label="Save"
            loading={save.isPending}
            disabled={!formState.isDirty}
            onPress={handleSubmit((values) => save.mutate(values))}
          />
        </View>
      </Card>
    </Screen>
  );
}
