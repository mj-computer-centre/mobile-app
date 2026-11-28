import { toAppError } from '@mcc/shared';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText, Button, IconChip, spacing, useTheme } from '@/ui';

/**
 * What a student sees when their time runs out: the answers are sent by themselves, and if the
 * connection fails they can try again or go back. The attempt has ended either way, and the
 * answers saved while they worked are already counted.
 */
export function TimeUpPanel({
  sending,
  error,
  onRetry,
  onLeave,
}: {
  sending: boolean;
  error: unknown;
  onRetry: () => void;
  onLeave: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.panel} accessibilityLiveRegion="polite">
      <IconChip
        name="timer-off-outline"
        tone={error && !sending ? 'danger' : 'primary'}
        size={56}
      />
      <AppText variant="title" accessibilityRole="header" style={styles.centre}>
        Time is up
      </AppText>
      {sending ? (
        <>
          <AppText color="textMuted" style={styles.centre}>
            Sending your answers…
          </AppText>
          <ActivityIndicator color={colors.primary} />
        </>
      ) : error ? (
        <>
          <AppText color="textMuted" style={styles.centre}>
            {toAppError(error).message} Your test has ended, and the answers that were saved while
            you worked are counted.
          </AppText>
          <View style={styles.actions}>
            <Button label="Try sending again" icon="refresh" onPress={onRetry} />
            <Button label="Back to the test" variant="secondary" onPress={onLeave} />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    minHeight: 320,
  },
  centre: { textAlign: 'center', maxWidth: 420 },
  actions: { gap: spacing.md, marginTop: spacing.sm, alignSelf: 'stretch', maxWidth: 360 },
});
