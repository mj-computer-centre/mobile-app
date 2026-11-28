import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { keyDepth, radius, spacing, useTheme, type ColorName } from '../theme';
import { AppText } from './app-text';
import { Icon, type IconName } from './icon';
import { Key, keyTones, type KeyTone } from './key';

/**
 * - accent: the Enter key. The one thing a screen most wants done (Start learning, Submit test).
 * - primary: an ordinary confirming action (Save, Add).
 * - secondary: a plain key for everything else.
 * - danger: a plain key with a red legend, for deleting.
 * - ghost: text only, for the quietest actions (Cancel, Close).
 */
type Variant = 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  /** An icon after the label, for actions that move forward. */
  iconAfter?: IconName;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const keyed: Record<Exclude<Variant, 'ghost'>, { tone: KeyTone; ink?: ColorName }> = {
  primary: { tone: 'primary' },
  accent: { tone: 'accent' },
  secondary: { tone: 'neutral', ink: 'primary' },
  danger: { tone: 'neutral', ink: 'danger' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconAfter,
  loading = false,
  disabled = false,
  compact = false,
  accessibilityHint,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const inactive = disabled || loading;
  const iconSize = compact ? 18 : 20;

  const content = (ink: ColorName) => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={colors[ink]} size="small" />
      ) : icon ? (
        <Icon name={icon} size={iconSize} color={ink} />
      ) : null}
      <AppText variant="label" color={ink} numberOfLines={1} style={styles.label}>
        {label}
      </AppText>
      {iconAfter && !loading ? <Icon name={iconAfter} size={iconSize} color={ink} /> : null}
    </View>
  );

  if (variant === 'ghost') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: inactive, busy: loading }}
        disabled={inactive}
        hitSlop={compact ? 6 : 0}
        onPress={onPress}
        style={({ pressed }) => [
          styles.ghost,
          compact && styles.ghostCompact,
          { opacity: inactive ? 0.5 : pressed ? 0.6 : 1 },
          style,
        ]}>
        {content('primary')}
      </Pressable>
    );
  }

  const { tone, ink } = keyed[variant];
  return (
    <Key
      tone={tone}
      depth={compact ? keyDepth.sm : keyDepth.md}
      cornerRadius={compact ? radius.sm + 2 : radius.md}
      onPress={onPress}
      disabled={inactive}
      // A compact key is 37 points tall; the margin brings what can be touched up to 49.
      {...(compact ? { hitSlop: 6 } : {})}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: loading }}
      style={style}
      faceStyle={compact ? styles.faceCompact : styles.face}>
      {content(ink ?? keyTones[tone].ink)}
    </Key>
  );
}

const styles = StyleSheet.create({
  face: { minHeight: 46, paddingHorizontal: spacing.lg },
  faceCompact: { minHeight: 34, paddingHorizontal: spacing.md },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  // Custom fonts carry extra padding on Android, which pushes a legend off the key's centre.
  label: { includeFontPadding: false, flexShrink: 1 },
  ghost: {
    minHeight: 46,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  ghostCompact: { minHeight: 36, paddingHorizontal: spacing.sm },
});
