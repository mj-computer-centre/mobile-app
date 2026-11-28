import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { routes } from '@/lib/routes';
import {
  AppText,
  BrandLockup,
  Button,
  IconButton,
  ListGroup,
  ListRow,
  MAX_WIDE_CONTENT_WIDTH,
  Sheet,
  spacing,
  useLayout,
  useTheme,
} from '@/ui';

export type SitePageName = 'home' | 'courses' | 'tests' | 'contact';

const PAGES: { name: SitePageName; label: string }[] = [
  { name: 'home', label: 'Home' },
  { name: 'courses', label: 'Courses' },
  { name: 'tests', label: 'Tests' },
  { name: 'contact', label: 'Contact' },
];

const PAGE_ROUTES = {
  home: routes.home,
  courses: routes.courses,
  tests: routes.tests,
  contact: routes.contact,
} as const;

/** Opens one of the website's main pages from a page outside the tab navigator. */
export function goToSitePage(page: SitePageName): void {
  router.navigate(PAGE_ROUTES[page]);
}

export interface SiteTopBarProps {
  /** The page being shown, or null for pages that are not in the bar (a course, the policy). */
  current: SitePageName | null;
  onNavigate?: (page: SitePageName) => void;
  topInset?: number;
}

/**
 * The bar across the top of the public website: the centre's name, the pages anyone may read,
 * and the way in. On a phone the pages move into a menu so the name and Sign in always fit.
 */
export function SiteTopBar({ current, onNavigate = goToSitePage, topInset = 0 }: SiteTopBarProps) {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          paddingTop: topInset,
        },
      ]}>
      <View style={[styles.inner, isWide && styles.innerWide]}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Mishra Computer Centre, home"
          onPress={() => onNavigate('home')}
          style={styles.brand}>
          <BrandLockup size={isWide ? 40 : 34} showPlace={isWide} />
        </Pressable>

        {isWide ? (
          <View style={styles.links} accessibilityRole="tablist">
            {PAGES.filter((page) => page.name !== 'home').map((page) => {
              const selected = page.name === current;
              return (
                <Pressable
                  key={page.name}
                  accessibilityRole="tab"
                  accessibilityLabel={page.label}
                  accessibilityState={{ selected }}
                  onPress={() => onNavigate(page.name)}
                  style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
                  <AppText variant="label" color={selected ? 'text' : 'textMuted'}>
                    {page.label}
                  </AppText>
                  {/* The page you are on is underlined in the Enter key's colour. */}
                  <View
                    style={[
                      styles.underline,
                      { backgroundColor: selected ? colors.accent : 'transparent' },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Button label="Sign in" compact onPress={() => router.push(routes.signIn)} />
        {isWide ? null : (
          <IconButton icon="menu" label="Menu" color="text" onPress={() => setMenuOpen(true)} />
        )}
      </View>

      <Sheet visible={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <ListGroup>
          {PAGES.map((page) => (
            <ListRow
              key={page.name}
              title={page.label}
              navigates
              onPress={() => {
                setMenuOpen(false);
                onNavigate(page.name);
              }}
            />
          ))}
        </ListGroup>
        <ListGroup>
          <ListRow
            title="Privacy policy"
            navigates
            onPress={() => {
              setMenuOpen(false);
              router.push(routes.privacy);
            }}
          />
        </ListGroup>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderBottomWidth: StyleSheet.hairlineWidth },
  inner: {
    width: '100%',
    maxWidth: MAX_WIDE_CONTENT_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  innerWide: { minHeight: 72, paddingHorizontal: spacing.xxl, gap: spacing.lg },
  brand: { flex: 1, minWidth: 0 },
  links: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, marginRight: spacing.md },
  link: { paddingTop: spacing.sm, gap: spacing.xs + 2 },
  underline: { height: 3, borderRadius: 2 },
  pressed: { opacity: 0.6 },
});
