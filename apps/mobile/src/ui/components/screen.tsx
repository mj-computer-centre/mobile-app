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
   * card grids and dashboards use more of a desktop screen.
   */
  width?: 'narrow' | 'wide';
}

export function Screen({
  children,
  scroll = true,
  edges = ['bottom'],
  refreshing,
  onRefresh,
  padded = true,
  width = 'narrow',
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
              <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} />
            ) : undefined
          }>
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
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
    gap: spacing.lg,
  },
  padded: { padding: spacing.lg },
  paddedWide: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.xl + spacing.xs },
  gapWide: { gap: spacing.xl },
});
