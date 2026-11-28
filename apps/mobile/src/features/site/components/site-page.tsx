import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MAX_CONTENT_WIDTH,
  MAX_WIDE_CONTENT_WIDTH,
  spacing,
  useLayout,
  useTheme,
  type ColorName,
} from '@/ui';

import { SiteFooter } from './site-footer';
import { SiteTopBar, type SitePageName } from './site-top-bar';

/**
 * One band of a public page: a background that runs the full width of the window, with its
 * content held to the page's width. Pages are a stack of these.
 */
export function Section({
  children,
  background,
  width = 'wide',
  style,
}: {
  children: ReactNode;
  background?: ColorName;
  width?: 'narrow' | 'wide';
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  return (
    <View style={background ? { backgroundColor: colors[background] } : null}>
      <View
        style={[
          styles.section,
          { maxWidth: width === 'wide' ? MAX_WIDE_CONTENT_WIDTH : MAX_CONTENT_WIDTH },
          isWide ? styles.sectionWide : styles.sectionPhone,
          style,
        ]}>
        {children}
      </View>
    </View>
  );
}

/** The scrolling body of a public page, ending in the website's footer. */
export function SiteBody({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled">
      <View style={styles.grow}>{children}</View>
      <SiteFooter />
    </ScrollView>
  );
}

/**
 * A whole public page for routes outside the tab navigator (a course, the privacy policy): the
 * website's top bar, the page, the footer.
 */
export function SitePage({
  current = null,
  children,
}: {
  current?: SitePageName | null;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <SiteTopBar current={current} topInset={insets.top} />
      <SiteBody>{children}</SiteBody>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scroll: { flexGrow: 1 },
  grow: { flexGrow: 1 },
  section: { width: '100%', alignSelf: 'center', gap: spacing.xl },
  sectionPhone: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xxl },
  sectionWide: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.xxxl, gap: spacing.xxl },
});
