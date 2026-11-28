import { toAppError } from '@mcc/shared';
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { radius, spacing, useTheme } from '../theme';
import { AppText } from './app-text';
import { Button } from './button';
import type { IconName } from './icon';
import { IconChip } from './icon-chip';

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
      <IconChip
        name={appError.code === 'network' ? 'wifi-off' : 'alert-circle-outline'}
        tone={appError.code === 'network' ? 'neutral' : 'danger'}
        size={56}
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
      <IconChip name={icon} tone="neutral" size={56} />
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

/**
 * A grey block standing in for content that is loading, in the shape the content will take, so
 * the page does not jump when it arrives. It breathes gently unless the phone asks for less
 * motion.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  rounded = radius.sm,
  style,
}: {
  width?: DimensionValue;
  height?: DimensionValue;
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  // Held in state, not a ref: it is read while rendering.
  const [opacity] = useState(() => new Animated.Value(1));
  const [still, setStill] = useState(false);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (active) setStill(reduce);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (still) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, still]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width, height, borderRadius: rounded, backgroundColor: colors.surfaceMuted, opacity },
        style,
      ]}
    />
  );
}

/** A few placeholder rows, for lists that are still loading. */
export function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.rows} accessibilityRole="progressbar" accessibilityLabel="Loading">
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.row}>
          <Skeleton width={44} height={44} rounded={radius.md} />
          <View style={styles.rowText}>
            <Skeleton width="70%" height={15} />
            <Skeleton width="45%" height={12} />
          </View>
        </View>
      ))}
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
    minHeight: 240,
  },
  message: { textAlign: 'center', maxWidth: 420 },
  rows: { gap: spacing.lg, paddingVertical: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowText: { flex: 1, gap: spacing.sm },
});
