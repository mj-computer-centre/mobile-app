import { Text, type TextProps } from 'react-native';

import { typography, useTheme, type ThemeColors, type TypographyVariant } from '../theme';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: keyof ThemeColors;
}

export function AppText({ variant = 'body', color = 'text', style, ...props }: AppTextProps) {
  const { colors } = useTheme();
  return <Text {...props} style={[typography[variant], { color: colors[color] }, style]} />;
}
