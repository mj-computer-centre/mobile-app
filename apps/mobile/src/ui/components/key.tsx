import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type AccessibilityRole,
  type AccessibilityState,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { keyDepth, radius, useTheme, type ColorName } from '../theme';

export type KeyTone = 'accent' | 'primary' | 'neutral' | 'hero' | 'success' | 'danger';

interface ToneColors {
  face: ColorName;
  edge: ColorName;
  /** Colour for text and icons on the face. */
  ink: ColorName;
  /** A hairline around the face, for keys whose face matches the page. */
  outlined?: boolean;
}

export const keyTones: Record<KeyTone, ToneColors> = {
  accent: { face: 'accent', edge: 'accentEdge', ink: 'onAccent' },
  primary: { face: 'primary', edge: 'primaryEdge', ink: 'onPrimary' },
  neutral: { face: 'key', edge: 'keyEdge', ink: 'text', outlined: true },
  hero: { face: 'heroRaised', edge: 'heroEdge', ink: 'onHero' },
  success: { face: 'success', edge: 'successEdge', ink: 'onPrimary' },
  danger: { face: 'danger', edge: 'dangerEdge', ink: 'onPrimary' },
};

export interface KeyProps {
  children: ReactNode;
  tone?: KeyTone;
  /** Colours from outside the theme, for a course's own key. Replaces the tone's face and edge. */
  tint?: { face: string; edge: string } | undefined;
  /** How far the key sits above its edge. */
  depth?: number;
  cornerRadius?: number;
  onPress?: (() => void) | undefined;
  /** Held down: a chosen answer, a selected day. */
  latched?: boolean;
  disabled?: boolean;
  /** Extra touchable margin around a small key, so it is still easy to hit. */
  hitSlop?: number;
  /** Layout of the whole key (width, flex, margins). */
  style?: StyleProp<ViewStyle>;
  /** Layout inside the face (padding, alignment). */
  faceStyle?: StyleProp<ViewStyle>;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string | undefined;
  accessibilityHint?: string | undefined;
  accessibilityState?: AccessibilityState;
}

/** The web adds hover and keyboard focus to the pressed state React Native types declare. */
type PressState = PressableStateCallbackType & { hovered?: boolean; focused?: boolean };

/**
 * The shape everything pressable is built from: a face on a darker edge. Pressing moves the
 * face down onto the edge. The key's outer size never changes, so nothing around it shifts.
 */
export function Key({
  children,
  tone = 'neutral',
  tint,
  depth = keyDepth.md,
  cornerRadius = radius.md,
  onPress,
  latched = false,
  disabled = false,
  hitSlop,
  style,
  faceStyle,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}: KeyProps) {
  const { colors } = useTheme();
  const palette = keyTones[tone];

  const shell = (down: boolean, state?: PressState): StyleProp<ViewStyle> => [
    {
      borderRadius: cornerRadius,
      backgroundColor: tint?.edge ?? colors[palette.edge],
      paddingBottom: down ? 1 : depth,
      marginTop: down ? depth - 1 : 0,
      opacity: disabled ? 0.5 : 1,
    },
    state?.focused ? [styles.focused, { outlineColor: colors.primary }] : null,
    style,
  ];
  const face = (
    <View
      style={[
        styles.face,
        { borderRadius: cornerRadius, backgroundColor: tint?.face ?? colors[palette.face] },
        palette.outlined && !tint ? { borderWidth: 1, borderColor: colors[palette.edge] } : null,
        faceStyle,
      ]}>
      {children}
    </View>
  );

  if (!onPress) return <View style={shell(latched)}>{face}</View>;
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, ...accessibilityState }}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      style={(state: PressState) => shell(latched || state.pressed, state)}>
      {face}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: { alignItems: 'center', justifyContent: 'center' },
  focused: { outlineWidth: 2, outlineStyle: 'solid', outlineOffset: 2 },
});
