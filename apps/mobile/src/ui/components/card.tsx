import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing, useTheme } from '../theme';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, onPress, accessibilityLabel, padded = true, style }: CardProps) {
  const { colors } = useTheme();
  const cardStyle = [
    styles.card,
    padded && styles.padded,
    { backgroundColor: colors.surface, borderColor: colors.border },
    style,
  ];

  if (!onPress) return <View style={cardStyle}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
});
