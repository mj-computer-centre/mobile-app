import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, radius, spacing, useTheme } from '@/ui';

export interface AdminSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  /**
   * True (the default) puts the content in a padded card. False puts it on a list surface, for
   * rows that run edge to edge.
   */
  padded?: boolean;
  /**
   * No surface at all, for content that brings its own: a group of rows with buttons under it.
   * Wins over `padded`.
   */
  bare?: boolean;
}

/** A titled block on an admin screen: what it is, a line about it, then the content. */
export function AdminSection({
  title,
  description,
  children,
  padded = true,
  bare = false,
}: AdminSectionProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <AppText variant="heading" accessibilityRole="header">
          {title}
        </AppText>
        {description ? (
          <AppText variant="caption" color="textMuted">
            {description}
          </AppText>
        ) : null}
      </View>
      {bare ? (
        <View style={styles.bare}>{children}</View>
      ) : padded ? (
        <Card>{children}</Card>
      ) : (
        <View
          style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  heading: { gap: 2 },
  bare: { gap: spacing.md },
  // The same shape as ListGroup, without its automatic dividers: callers mix rows with footers.
  list: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
});
