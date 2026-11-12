import { StyleSheet, View } from 'react-native';

import { radius, spacing, useTheme, type ThemeColors } from '../theme';
import { AppText } from './app-text';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const tones: Record<Tone, { bg: keyof ThemeColors; fg: keyof ThemeColors }> = {
  neutral: { bg: 'surfaceMuted', fg: 'textMuted' },
  primary: { bg: 'primarySoft', fg: 'primary' },
  success: { bg: 'successSoft', fg: 'success' },
  warning: { bg: 'warningSoft', fg: 'warning' },
  danger: { bg: 'dangerSoft', fg: 'danger' },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: colors[tones[tone].bg] }]}>
      <AppText variant="caption" color={tones[tone].fg} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  text: { fontWeight: '600' },
});
