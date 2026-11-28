import { formatWindow, type AdminTest } from '@mcc/shared';
import { Pressable, StyleSheet, View, type PressableStateCallbackType } from 'react-native';

import { CalendarLeaf, testSize } from '@/features/tests';
import { AppText, Badge, IconButton, spacing, useTheme } from '@/ui';

type RowState = PressableStateCallbackType & { hovered?: boolean };

/** How many students have taken a test, in words; nothing to say before it has opened. */
function takenBy(test: AdminTest, now: number): string | null {
  if (test.attemptCount > 0) {
    return `${test.attemptCount} student${test.attemptCount === 1 ? '' : 's'} took it`;
  }
  return Date.parse(test.endsAt) <= now ? 'Nobody took it' : null;
}

/**
 * One test in the admin list: its day, name, window and size, and what staff most need to know
 * at a glance (still a draft, open right now, late attempts allowed, no questions yet).
 *
 * Only the main area opens the test; the results button sits beside it, because a button inside
 * a pressable row is invalid on the web and confusing to screen readers.
 */
export function AdminTestRow({
  test,
  now,
  onOpen,
  onOpenResults,
}: {
  test: AdminTest;
  /** The device's time when the list was opened. */
  now: number;
  onOpen: () => void;
  onOpenResults: () => void;
}) {
  const { colors } = useTheme();
  const open =
    test.isPublished && Date.parse(test.startsAt) <= now && now < Date.parse(test.endsAt);
  const taken = takenBy(test, now);

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${test.title}. ${formatWindow(test.startsAt, test.endsAt)}${test.isPublished ? '' : '. Draft'}`}
        accessibilityHint="Opens the test to change it"
        onPress={onOpen}
        android_ripple={{ color: colors.surfaceMuted }}
        style={(state: RowState) => [
          styles.main,
          (state.pressed || state.hovered) && { backgroundColor: colors.surfaceMuted },
        ]}>
        <CalendarLeaf date={test.startsAt} />
        <View style={styles.text}>
          <AppText variant="subheading" numberOfLines={2}>
            {test.title}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {formatWindow(test.startsAt, test.endsAt)}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {test.courseTitle ? `${test.courseTitle} · ` : ''}
            {testSize(test)}
          </AppText>
          <View style={styles.status}>
            {test.isPublished ? null : <Badge label="Draft" tone="warning" icon="pencil-outline" />}
            {open ? <Badge label="Open now" tone="success" /> : null}
            {test.allowLate ? (
              <Badge label="Late attempts on" tone="accent" icon="history" />
            ) : null}
            {test.questionCount === 0 ? (
              <Badge label="No questions yet" tone="danger" icon="alert-circle-outline" />
            ) : null}
            {taken ? (
              <AppText variant="caption" color="textMuted">
                {taken}
              </AppText>
            ) : null}
          </View>
        </View>
      </Pressable>
      <View style={styles.trailing}>
        <IconButton
          icon="chart-box-outline"
          label={`Results of ${test.title}`}
          color="primary"
          onPress={onOpenResults}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  text: { flex: 1, gap: 2 },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  trailing: { paddingRight: spacing.sm },
});
