import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, spacing } from '@/ui';

/** A titled block on an admin screen. `padded={false}` for lists that run edge to edge. */
export function AdminSection({
  title,
  description,
  children,
  padded = true,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <AppText variant="heading">{title}</AppText>
        {description ? (
          <AppText variant="caption" color="textMuted">
            {description}
          </AppText>
        ) : null}
      </View>
      <Card padded={padded}>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  heading: { gap: 2 },
});
