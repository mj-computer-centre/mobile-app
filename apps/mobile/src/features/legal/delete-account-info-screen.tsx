import { formatIndianMobile } from '@mcc/shared';
import { Link, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/features/auth';
import { useSettings } from '@/features/contact';
import { PageTitle } from '@/lib/page-title';
import { routes } from '@/lib/routes';
import { AppText, Button, KeyCap, spacing } from '@/ui';

import { LegalPage } from './legal-page';

const STEPS = [
  'Open the Mishra Computer Centre app, or this website, and sign in with your Google account.',
  'Open Profile.',
  'Press “Delete my account” and confirm.',
];

const DELETED = [
  'Your name and email address',
  'Your mobile number, village or town and course interest',
  'Every test you took: your answers, scores and ranks',
];

/**
 * Public page for Google Play's "account deletion URL" (https://<website>/delete-account). It
 * names the app, gives the steps, says exactly what is deleted, and takes a signed-in visitor
 * straight to the place where they can do it.
 */
export function DeleteAccountInfoScreen() {
  const { session } = useAuth();
  const settings = useSettings();
  const centre = settings.data;

  return (
    <LegalPage>
      <PageTitle
        title="Delete your account"
        description="How to delete your Mishra Computer Centre account and everything kept with it."
      />
      <View style={styles.heading}>
        <AppText variant="display" accessibilityRole="header">
          Delete your account
        </AppText>
        <AppText color="textMuted">
          For the Mishra Computer Centre app and website, from Mishra Computer Centre, Makhdumpur,
          Jehanabad.
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="heading" accessibilityRole="header">
          How to delete it yourself
        </AppText>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.step}>
            <KeyCap legend={String(index + 1)} size={34} tone="primary" />
            <AppText style={styles.grow}>{step}</AppText>
          </View>
        ))}
        {session ? (
          <View style={styles.action}>
            <Button
              label="Go to my profile"
              iconAfter="arrow-right"
              onPress={() => router.replace(routes.profile)}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <AppText variant="heading" accessibilityRole="header">
          What is deleted
        </AppText>
        {DELETED.map((item) => (
          <View key={item} style={styles.point}>
            <AppText color="textMuted">•</AppText>
            <AppText style={styles.grow}>{item}</AppText>
          </View>
        ))}
        <AppText>
          All of it is deleted from our database at once and cannot be brought back. We keep nothing
          about you afterwards. You are welcome to sign up again later; you would start afresh.
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="heading" accessibilityRole="header">
          Cannot sign in?
        </AppText>
        <AppText>
          Ask the centre to delete your account for you. Tell them the Gmail address you signed in
          with.
        </AppText>
        {centre?.phone ? <AppText>Phone: {formatIndianMobile(centre.phone)}</AppText> : null}
        {centre?.email ? <AppText>Email: {centre.email}</AppText> : null}
        <AppText>
          Every way to reach the centre is on the{' '}
          <Link href={routes.contact}>
            <AppText color="primary">Contact</AppText>
          </Link>{' '}
          page. What the centre keeps and why is in the{' '}
          <Link href={routes.privacy}>
            <AppText color="primary">privacy policy</AppText>
          </Link>
          .
        </AppText>
      </View>
    </LegalPage>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.xs },
  section: { gap: spacing.md },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  point: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  grow: { flex: 1 },
  action: { alignSelf: 'flex-start' },
});
