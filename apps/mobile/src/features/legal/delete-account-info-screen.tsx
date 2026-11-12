import { router } from 'expo-router';

import { useAuth } from '@/features/auth';
import { routes } from '@/lib/routes';
import { AppText, Button, Card, Screen } from '@/ui';

/**
 * Public page for Google Play's "account deletion URL". Explains how to delete an account, and
 * takes a signed-in visitor straight to the place where they can do it.
 */
export function DeleteAccountInfoScreen() {
  const { session } = useAuth();

  return (
    <Screen edges={['bottom']}>
      <AppText variant="title">Delete your account</AppText>
      <Card>
        <AppText variant="heading">In the app</AppText>
        <AppText>1. Open the Mishra Computer Centre app and sign in.</AppText>
        <AppText>2. Go to Profile.</AppText>
        <AppText>3. Tap “Delete my account” and confirm.</AppText>
      </Card>
      <AppText>
        Your name, email address, mobile number, village or town and course interest are deleted
        permanently. Nothing is kept.
      </AppText>
      <AppText color="textMuted">
        Cannot open the app? Contact the centre using the details on its Contact page and ask for
        your account to be deleted.
      </AppText>
      {session ? (
        <Button label="Go to my profile" onPress={() => router.replace(routes.profile)} />
      ) : null}
    </Screen>
  );
}
