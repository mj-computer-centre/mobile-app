import { StyleSheet, View } from 'react-native';

import { radius, useTheme, type ThemeColors } from '../theme';
import { Icon, type IconName } from './icon';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

const tones: Record<Tone, { bg: keyof ThemeColors; fg: keyof ThemeColors }> = {
  primary: { bg: 'primarySoft', fg: 'primary' },
  success: { bg: 'successSoft', fg: 'success' },
  warning: { bg: 'warningSoft', fg: 'warning' },
  danger: { bg: 'dangerSoft', fg: 'danger' },
  neutral: { bg: 'surfaceMuted', fg: 'textMuted' },
};

/** An icon on a soft rounded square: marks stats, menu rows and feature lists. */
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
      style={[styles.chip, { width: size, height: size, backgroundColor: colors[tones[tone].bg] }]}>
      <Icon name={name} size={Math.round(size * 0.55)} color={tones[tone].fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
