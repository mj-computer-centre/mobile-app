import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, shadows, spacing, useTheme } from '../theme';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  padded?: boolean;
  /** Lifts the card off the page. For the few things that float: dialogs, the sign-in panel. */
  raised?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * A surface for one self-contained thing. Lists of rows use ListGroup instead, and most page
 * content sits straight on the background: not everything is a card.
 */
export function Card({
  children,
  onPress,
  accessibilityLabel,
  padded = true,
  raised = false,
  style,
}: CardProps) {
  const { colors, dark } = useTheme();
  const cardStyle = [
    styles.card,
    padded && styles.padded,
    { backgroundColor: colors.surface, borderColor: colors.border },
    // Shadows read as dirt on a dark background; the border carries the edge there.
    !dark && (raised ? shadows.raised : shadows.card),
    style,
  ];

  if (!onPress) return <View style={cardStyle}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && { backgroundColor: colors.surfaceMuted }]}>
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
  padded: { padding: spacing.lg },
});
