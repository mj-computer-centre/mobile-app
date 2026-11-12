import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { routes } from '@/lib/routes';
import { AppText, Button, Icon, Screen, spacing, useTheme } from '@/ui';

import { useSignIn } from '../use-auth-actions';

export function SignInScreen() {
  const { colors } = useTheme();
  const signIn = useSignIn();

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <View style={[styles.logo, { backgroundColor: colors.primarySoft }]}>
          <Icon name="laptop" size={48} color="primary" />
        </View>
        <AppText variant="title" style={styles.centre}>
          Mishra Computer Centre
        </AppText>
        <AppText color="textMuted" style={styles.centre}>
          Free computer courses with video lessons and PDF notes: ADCA, DCA, Tally and more.
        </AppText>
      </View>

      <View style={styles.actions}>
        <Button
          label="Continue with Google"
          icon="google"
          loading={signIn.isPending}
          onPress={() => signIn.mutate()}
        />
        {signIn.isError ? (
          <AppText color="danger" style={styles.centre} accessibilityLiveRegion="polite">
            Could not sign in. Check your internet connection and try again.
          </AppText>
        ) : null}
        <AppText variant="caption" color="textMuted" style={styles.centre}>
          By continuing you agree to our{' '}
          <Link href={routes.privacy}>
            <AppText variant="caption" color="primary">
              privacy policy
            </AppText>
          </Link>
          .
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  logo: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  actions: { gap: spacing.md, paddingBottom: spacing.xl },
  centre: { textAlign: 'center' },
});
