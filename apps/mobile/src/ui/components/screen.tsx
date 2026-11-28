import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MAX_CONTENT_WIDTH, MAX_WIDE_CONTENT_WIDTH, spacing, useLayout, useTheme } from '../theme';

export interface ScreenProps {
  children: ReactNode;
  /** Scrolls by default; pass false for screens that manage their own list or player. */
  scroll?: boolean;
  /** Safe-area edges to pad. Screens under a header only need the bottom. */
  edges?: Edge[];
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  /**
   * `narrow` (default) keeps forms and reading pages at a comfortable line length; `wide` lets
   * grids and dashboards use more of a desktop screen.
   */
  width?: 'narrow' | 'wide';
  /** Full-width content after the page, inside the scroll: the public website's footer. */
  footer?: ReactNode;
  /** Pinned under the content, outside the scroll: a test's Next and Submit bar. */
  bottomBar?: ReactNode;
}

export function Screen({
  children,
  scroll = true,
  edges = ['bottom'],
  refreshing,
  onRefresh,
  padded = true,
  width = 'narrow',
  footer,
  bottomBar,
}: ScreenProps) {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  const inner = (
    <View
      style={[
        styles.inner,
        { maxWidth: width === 'wide' ? MAX_WIDE_CONTENT_WIDTH : MAX_CONTENT_WIDTH },
        padded && (isWide ? styles.paddedWide : styles.padded),
        isWide && styles.gapWide,
      ]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={Boolean(refreshing)}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            ) : undefined
          }>
          {inner}
          {footer}
        </ScrollView>
      ) : (
        inner
      )}
      {bottomBar}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    // Sections of a page sit this far apart; rows inside a section sit closer (spacing.md).
    gap: spacing.xl,
  },
  padded: { padding: spacing.lg, paddingBottom: spacing.xxl },
  paddedWide: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  gapWide: { gap: spacing.xxl },
});
