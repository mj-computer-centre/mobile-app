import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MAX_CONTENT_WIDTH, spacing, useTheme } from '../theme';

export interface ScreenProps {
  children: ReactNode;
  /** Scrolls by default; pass false for screens that manage their own list or player. */
  scroll?: boolean;
  /** Safe-area edges to pad. Screens under a header only need the bottom. */
  edges?: Edge[];
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
}

export function Screen({
  children,
  scroll = true,
  edges = ['bottom'],
  refreshing,
  onRefresh,
  padded = true,
}: ScreenProps) {
  const { colors } = useTheme();
  const inner = <View style={[styles.inner, padded && styles.padded]}>{children}</View>;

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
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: spacing.lg,
  },
  padded: { padding: spacing.lg },
});
