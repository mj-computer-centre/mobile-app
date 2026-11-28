import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, Icon, spacing } from '@/ui';

import { useStaffRole } from '../access';

/**
 * Keys only the centre's staff see, on a page students see too: the way into the admin panel
 * from where the staff member already is. Renders nothing for a student. Hiding the keys is
 * for tidiness only: the admin pages and the database refuse anyone who is not staff.
 */
export function StaffActions({ note, children }: { note: string; children: ReactNode }) {
  const role = useStaffRole();
  if (!role) return null;
  return (
    <Card>
      <View style={styles.body}>
        <View style={styles.title}>
          <Icon name="shield-account-outline" size={18} color="primary" />
          <AppText variant="label">For staff</AppText>
        </View>
        <AppText variant="caption" color="textMuted">
          {note}
        </AppText>
        <View style={styles.keys}>{children}</View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.sm },
  title: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  keys: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
});
