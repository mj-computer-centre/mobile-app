import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useSettings } from '@/features/contact';
import { routes } from '@/lib/routes';
import { AppText, BrandLockup, MAX_WIDE_CONTENT_WIDTH, spacing, useLayout, useTheme } from '@/ui';

interface FooterLink {
  label: string;
  href: Href;
}

const GROUPS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Learn',
    links: [
      { label: 'Courses', href: routes.courses },
      { label: 'Tests', href: routes.tests },
      { label: 'Sign in', href: routes.signIn },
    ],
  },
  {
    title: 'The centre',
    links: [{ label: 'Contact', href: routes.contact }],
  },
  {
    title: 'Your data',
    links: [
      { label: 'Privacy policy', href: routes.privacy },
      { label: 'Delete your account', href: routes.deleteAccountInfo },
    ],
  },
];

// Read once when the page loads; a footer does not need to notice midnight on New Year's Eve.
const YEAR = new Date().getFullYear();

/** The foot of every public page: where things are, and the two pages Google Play asks for. */
export function SiteFooter() {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  const settings = useSettings();
  const address = settings.data?.address;

  return (
    <View style={[styles.band, { backgroundColor: colors.hero }]} accessibilityRole="summary">
      <View style={[styles.inner, isWide && styles.innerWide]}>
        <View style={styles.about}>
          <BrandLockup onHero />
          {address ? (
            <AppText variant="caption" color="onHeroMuted" style={styles.address}>
              {address}
            </AppText>
          ) : null}
        </View>
        <View style={[styles.groups, isWide && styles.groupsWide]}>
          {GROUPS.map((group) => (
            <View key={group.title} style={styles.group}>
              <AppText variant="label" color="onHero">
                {group.title}
              </AppText>
              {group.links.map((link) => (
                <Pressable
                  key={link.label}
                  accessibilityRole="link"
                  accessibilityLabel={link.label}
                  hitSlop={6}
                  onPress={() => router.navigate(link.href)}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <AppText color="onHeroMuted">{link.label}</AppText>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </View>
      <View style={[styles.rule, { backgroundColor: colors.onHeroSubtle }]} />
      <View style={[styles.inner, styles.bottom, isWide && styles.innerWide]}>
        <AppText variant="caption" color="onHeroMuted">
          © {YEAR} Mishra Computer Centre, Makhdumpur, Jehanabad, Bihar
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { marginTop: spacing.xxxl },
  inner: {
    width: '100%',
    maxWidth: MAX_WIDE_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    gap: spacing.xxl,
  },
  innerWide: { flexDirection: 'row', paddingHorizontal: spacing.xxl },
  about: { flex: 1, gap: spacing.md, minWidth: 0 },
  address: { maxWidth: 320 },
  groups: { gap: spacing.xl },
  groupsWide: { flexDirection: 'row', gap: spacing.huge },
  group: { gap: spacing.md },
  rule: { height: StyleSheet.hairlineWidth },
  bottom: { paddingVertical: spacing.lg },
  pressed: { opacity: 0.6 },
});
