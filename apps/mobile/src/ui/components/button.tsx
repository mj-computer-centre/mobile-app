import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, useTheme, type ThemeColors } from '../theme';
import { AppText } from './app-text';
import { Icon, type IconName } from './icon';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  accessibilityHint?: string;
}

const variantColors: Record<
  Variant,
  { bg: keyof ThemeColors | null; fg: keyof ThemeColors; border?: keyof ThemeColors }
> = {
  primary: { bg: 'primary', fg: 'onPrimary' },
  secondary: { bg: 'surface', fg: 'primary', border: 'border' },
  danger: { bg: 'dangerSoft', fg: 'danger' },
  ghost: { bg: null, fg: 'primary' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  compact = false,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const tone = variantColors[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        {
          backgroundColor: tone.bg ? colors[tone.bg] : 'transparent',
          borderColor: tone.border ? colors[tone.border] : 'transparent',
          opacity: inactive ? 0.55 : pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors[tone.fg]} size="small" />
        ) : icon ? (
          <Icon name={icon} size={compact ? 18 : 20} color={tone.fg} />
        ) : null}
        <AppText variant="label" color={tone.fg}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
  compact: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
