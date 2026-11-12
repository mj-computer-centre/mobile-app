import { Pressable, StyleSheet } from 'react-native';

import { radius, type ThemeColors } from '../theme';
import { Icon, type IconName } from './icon';

export interface IconButtonProps {
  icon: IconName;
  /** Read out by screen readers; icon-only buttons must say what they do. */
  label: string;
  onPress: () => void;
  color?: keyof ThemeColors;
  disabled?: boolean;
}

export function IconButton({
  icon,
  label,
  onPress,
  color = 'textMuted',
  disabled,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { opacity: disabled ? 0.3 : pressed ? 0.6 : 1 }]}>
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
