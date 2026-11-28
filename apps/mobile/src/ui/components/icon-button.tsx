import { Pressable, StyleSheet } from 'react-native';

import { radius, useTheme, type ColorName } from '../theme';
import { Icon, type IconName } from './icon';

export interface IconButtonProps {
  icon: IconName;
  /** Read out by screen readers; icon-only buttons must say what they do. */
  label: string;
  onPress: () => void;
  color?: ColorName;
  disabled?: boolean;
  /** A soft tile behind the icon, for buttons that stand alone rather than in a row of tools. */
  tonal?: boolean;
}

export function IconButton({
  icon,
  label,
  onPress,
  color = 'textMuted',
  disabled,
  tonal,
}: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      android_ripple={{ color: colors.surfaceMuted, borderless: true, radius: 22 }}
      style={({ pressed }) => [
        styles.button,
        tonal ? { backgroundColor: colors.surfaceMuted } : null,
        { opacity: disabled ? 0.3 : pressed ? 0.6 : 1 },
      ]}>
      <Icon name={icon} color={color} size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
});
