import { toAppError } from '@mcc/shared';
import { Link, router } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageTitle } from '@/lib/page-title';
import { routes } from '@/lib/routes';
import {
  AppText,
  BrandMark,
  Button,
  CENTRE_NAME,
  CENTRE_PLACE,
  Icon,
  radius,
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
  { icon: 'clipboard-text-clock-outline', text: 'Timed tests with your score and rank' },
];

export function SignInScreen() {
  const { isWide } = useLayout();
  return (
    <>
      <PageTitle title="Sign in" />
      {isWide ? <WideSignIn /> : <PhoneSignIn />}
    </>
  );
}

/** Phones: the centre's name on its own colour, with the way in at thumb height. */
function PhoneSignIn() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.phoneRoot, { backgroundColor: colors.hero }]}>
      <ScrollView contentContainerStyle={styles.phoneScroll}>
        <View style={styles.phoneBrand}>
          <BrandMark size={72} />
          <View style={styles.brandText}>
            <AppText variant="display" color="onHero" accessibilityRole="header">
              {CENTRE_NAME}
            </AppText>
            <AppText color="onHeroMuted">{CENTRE_PLACE}</AppText>
          </View>
          <Features />
        </View>
        <View style={[styles.phoneActions, { backgroundColor: colors.background }]}>
          <SignInActions />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Wide screens: the brand panel on the left, the sign-in card on the right. */
function WideSignIn() {
  const { colors, dark } = useTheme();
  return (
    <SafeAreaView style={[styles.wideRoot, { backgroundColor: colors.background }]}>
      <View style={[styles.brandPanel, { backgroundColor: colors.hero }]}>
        <BrandMark size={72} />
        <View style={styles.brandText}>
          <AppText variant="hero" color="onHero" accessibilityRole="header">
            {CENTRE_NAME}
          </AppText>
          <AppText color="onHeroMuted" style={styles.brandLead}>
            Learn computers at your own pace with the centre’s video lessons, notes and tests.
          </AppText>
        </View>
        <Features />
      </View>

      <ScrollView contentContainerStyle={styles.formPane}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
            !dark && shadows.raised,
          ]}>
          <View style={styles.cardHeading}>
            <AppText variant="title">Sign in</AppText>
            <AppText color="textMuted">
              Use your Google account to open your courses and tests. Staff use the same button to
              reach the admin panel.
            </AppText>
          </View>
          <SignInActions />
        </View>
        {Platform.OS === 'web' ? (
          <Button
            label="Back to the website"
            variant="ghost"
            icon="arrow-left"
            onPress={() => router.replace(routes.home)}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Features() {
  const { colors } = useTheme();
  return (
    <View style={styles.features}>
      {FEATURES.map((feature) => (
        <View key={feature.icon} style={styles.feature}>
          <View style={[styles.featureIcon, { backgroundColor: colors.onHeroSubtle }]}>
            <Icon name={feature.icon} size={20} color="onHero" />
          </View>
          <AppText color="onHero" style={styles.grow}>
            {feature.text}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function SignInActions() {
  const signIn = useSignIn();
  const error = signIn.isError ? toAppError(signIn.error) : null;
  return (
    <View style={styles.actions}>
      {/* A plain white key with Google's mark, as Google asks sign-in buttons to look. */}
      <Button
        label="Continue with Google"
        icon="google"
        variant="secondary"
        loading={signIn.isPending}
        onPress={() => signIn.mutate()}
      />
      {error ? (
        <AppText color="danger" style={styles.centre} accessibilityLiveRegion="polite">
          {error.code === 'network' || error.code === 'demo_mode'
            ? error.message
            : 'Could not sign in. Check your internet connection and try again.'}
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

const styles = StyleSheet.create({
  phoneRoot: { flex: 1 },
  phoneScroll: { flexGrow: 1 },
  phoneBrand: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  phoneActions: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  brandText: { gap: spacing.sm },
  features: { gap: spacing.md },
  feature: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { gap: spacing.md },
  centre: { textAlign: 'center' },
  grow: { flex: 1 },

  wideRoot: { flex: 1, flexDirection: 'row' },
  brandPanel: {
    flex: 1,
    maxWidth: 600,
    padding: spacing.huge,
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  brandLead: { fontSize: 17, lineHeight: 26, maxWidth: 420 },
  formPane: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.lg,
  },
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
