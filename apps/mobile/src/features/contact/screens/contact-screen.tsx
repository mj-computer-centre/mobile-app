import { View } from 'react-native';

import { AppText, ErrorState, Screen, SkeletonRows, spacing } from '@/ui';

import { useSettings } from '../api';
import { ContactDetails } from '../components/contact-details';

// Contacting the centre deliberately opens the phone dialer, WhatsApp or Maps; these are the
// only links in the app that leave it, and only when the student presses them.
export function ContactScreen() {
  const settings = useSettings();

  return (
    <Screen edges={[]} refreshing={settings.isRefetching} onRefresh={() => void settings.refetch()}>
      {settings.isPending ? (
        <SkeletonRows count={4} />
      ) : settings.isError ? (
        <ErrorState error={settings.error} onRetry={() => void settings.refetch()} />
      ) : (
        <>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="title" accessibilityRole="header">
              {settings.data.centre_name}
            </AppText>
            <AppText color="textMuted">Visit, call or message the centre.</AppText>
          </View>
          <ContactDetails settings={settings.data} />
        </>
      )}
    </Screen>
  );
}
