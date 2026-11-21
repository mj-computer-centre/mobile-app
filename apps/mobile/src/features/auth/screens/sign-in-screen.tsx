import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { routes } from '@/lib/routes';
import {
  AppText,
  Button,
  Icon,
  radius,
  Screen,
  shadows,
  spacing,
  useLayout,
  useTheme,
  type IconName,
} from '@/ui';

import { useSignIn } from '../use-auth-actions';

const FEATURES: { icon: IconName; text: string }[] = [
  { icon: 'play-circle-outline', text: 'Video lessons that play right inside the app' },
  { icon: 'file-document-outline', text: 'PDF notes for every unit' },
  { icon: 'school-outline', text: 'ADCA, DCA, Tally and more, free for now' },
];

export function SignInScreen() {
  const { isWide } = useLayout();
  return isWide ? <WideSignIn /> : <PhoneSignIn />;
}

/** Phones: the centre's name and what the app offers, with the sign-in button at thumb height. */
function PhoneSignIn() {
  const { colors } = useTheme();
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
          Free computer courses with video lessons and PDF notes.
        </AppText>
        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <Feature key={feature.icon} {...feature} />
          ))}
        </View>
      </View>
      <View style={styles.phoneActions}>
        <SignInActions />
      </View>
    </Screen>
  );
}

/** Wide screens: a brand panel on the left and a sign-in card on the right. */
function WideSignIn() {
  const { colors, dark } = useTheme();
  return (
    <SafeAreaView style={[styles.wideRoot, { backgroundColor: colors.background }]}>
      <View style={[styles.brandPanel, { backgroundColor: colors.hero }]}>
        <View style={[styles.brandLogo, { backgroundColor: colors.onHeroSubtle }]}>
          <Icon name="laptop" size={36} color="onHero" />
        </View>
        <View style={styles.brandText}>
          <AppText variant="overline" color="onHeroMuted">
            MAKHDUMPUR · JEHANABAD
          </AppText>
          <AppText variant="display" color="onHero">
            Mishra Computer Centre
          </AppText>
          <AppText color="onHeroMuted" style={styles.brandLead}>
            Learn computers at your own pace with the centre’s video lessons and notes.
          </AppText>
        </View>
        <View style={styles.brandFeatures}>
          {FEATURES.map((feature) => (
            <View key={feature.icon} style={styles.brandFeature}>
              <View style={[styles.brandFeatureIcon, { backgroundColor: colors.onHeroSubtle }]}>
                <Icon name={feature.icon} size={20} color="onHero" />
              </View>
              <AppText color="onHero" style={styles.grow}>
                {feature.text}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.formPane}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
            !dark && shadows.raised,
          ]}>
          <View style={styles.cardHeading}>
            <AppText variant="title">Welcome</AppText>
            <AppText color="textMuted">
              Sign in with your Google account to open your courses. Staff use the same button to
              reach the admin panel.
            </AppText>
          </View>
          <SignInActions />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SignInActions() {
  const signIn = useSignIn();
  return (
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
  );
}

function Feature({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.feature}>
      <Icon name={icon} size={20} color="primary" />
      <AppText style={styles.grow}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  logo: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  features: { alignSelf: 'stretch', gap: spacing.md, marginTop: spacing.lg },
  feature: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  actions: { gap: spacing.md },
  phoneActions: { paddingBottom: spacing.xl },
  centre: { textAlign: 'center' },
  grow: { flex: 1 },

  wideRoot: { flex: 1, flexDirection: 'row' },
  brandPanel: {
    flex: 1,
    maxWidth: 560,
    padding: spacing.xxl * 2,
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  brandLogo: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { gap: spacing.sm },
  brandLead: { fontSize: 17, lineHeight: 26 },
  brandFeatures: { gap: spacing.lg },
  brandFeature: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandFeatureIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formPane: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: spacing.xxl,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xl,
  },
  cardHeading: { gap: spacing.sm },
});
