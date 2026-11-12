import { toAppError } from '@mcc/shared';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { spacing, useTheme } from '../theme';
import { AppText } from './app-text';
import { Button } from './button';
import { Icon, type IconName } from './icon';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.centre} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const appError = toAppError(error);
  return (
    <View style={styles.centre}>
      <Icon
        name={appError.code === 'network' ? 'wifi-off' : 'alert-circle-outline'}
        size={40}
        color="textMuted"
      />
      <AppText style={styles.message}>{appError.message}</AppText>
      {onRetry ? (
        <Button label="Try again" variant="secondary" icon="refresh" onPress={onRetry} />
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: IconName;
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.centre}>
      <Icon name={icon} size={40} color="textMuted" />
      <AppText variant="heading" style={styles.message}>
        {title}
      </AppText>
      {message ? (
        <AppText color="textMuted" style={styles.message}>
          {message}
        </AppText>
      ) : null}
      {action ? <Button label={action.label} onPress={action.onPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    minHeight: 220,
  },
  message: { textAlign: 'center' },
});
