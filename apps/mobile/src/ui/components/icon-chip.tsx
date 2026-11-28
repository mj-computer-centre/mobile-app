import { StyleSheet, View } from 'react-native';

import { radius, useTheme, type ColorName } from '../theme';
import { Icon, type IconName } from './icon';

export type Tone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

export const toneColors: Record<Tone, { bg: ColorName; fg: ColorName }> = {
  primary: { bg: 'primarySoft', fg: 'primary' },
  accent: { bg: 'accentSoft', fg: 'warning' },
  success: { bg: 'successSoft', fg: 'success' },
  warning: { bg: 'warningSoft', fg: 'warning' },
  danger: { bg: 'dangerSoft', fg: 'danger' },
  neutral: { bg: 'surfaceMuted', fg: 'textMuted' },
};

/** An icon on a soft rounded square: marks menu rows, facts and empty states. */
export function IconChip({
  name,
  tone = 'primary',
  size = 40,
}: {
  name: IconName;
  tone?: Tone;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.chip,
        { width: size, height: size, backgroundColor: colors[toneColors[tone].bg] },
      ]}>
      <Icon name={name} size={Math.round(size * 0.55)} color={toneColors[tone].fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
