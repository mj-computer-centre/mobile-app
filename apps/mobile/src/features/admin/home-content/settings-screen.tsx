import { zodResolver } from '@hookform/resolvers/zod';
import { settingsFormSchema, settingsRowToForm, type SettingsFormValues } from '@mcc/shared';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { useSettings, type CentreSettings } from '@/features/contact';
import {
  AppText,
  Button,
  ErrorState,
  FormTextField,
  LoadingState,
  Notice,
  Screen,
  spacing,
} from '@/ui';

import { AdminSection } from '../shared/admin-section';
import { ErrorNotice } from '../shared/error-notice';
import { useSaveSettings } from './hooks';

type SaveSettings = ReturnType<typeof useSaveSettings>;

/** "Centre details": what the Contact page of the app and the website say about the centre. */
export function SettingsScreen() {
  const settings = useSettings();
  // The form below starts again from the saved values after every save. Keeping the save here,
  // outside it, is what lets "Saved" stay on screen once that has happened.
  const save = useSaveSettings();

  if (settings.isPending) return <LoadingState />;
  if (settings.isError)
    return <ErrorState error={settings.error} onRetry={() => void settings.refetch()} />;
  return <SettingsForm key={settings.data.updated_at} settings={settings.data} save={save} />;
}

function SettingsForm({ settings, save }: { settings: CentreSettings; save: SaveSettings }) {
  const { control, handleSubmit, formState } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settingsRowToForm(settings),
  });

  return (
    <Screen edges={[]}>
      <AppText color="textMuted">
        These details show on the Contact page of the app and on the website. Leave a field empty to
        hide it.
      </AppText>

      <AdminSection title="Name and contact">
        <View style={styles.fields}>
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
        </View>
      </AdminSection>

      <AdminSection title="Where and when">
        <View style={styles.fields}>
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
        </View>
      </AdminSection>

      <AdminSection title="Links">
        <View style={styles.fields}>
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
          <FormTextField
            control={control}
            name="playStoreUrl"
            label="Play Store link"
            hint="Paste the app’s Play Store page once it is published. The website then shows a Get the app button."
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
      </AdminSection>

      <ErrorNotice error={save.error} />
      {save.isSuccess && !formState.isDirty ? <Notice tone="success">Saved.</Notice> : null}
      <Button
        label="Save"
        loading={save.isPending}
        disabled={!formState.isDirty}
        onPress={handleSubmit((values) => save.mutate(values))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.lg },
});
