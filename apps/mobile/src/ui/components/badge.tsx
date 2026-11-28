import { StyleSheet, View } from 'react-native';

import { radius, spacing, useTheme } from '../theme';
import { AppText } from './app-text';
import { Icon, type IconName } from './icon';
import { toneColors, type Tone } from './icon-chip';

/** A short status word: "Live", "Draft", "Late". */
export function Badge({
  label,
  tone = 'neutral',
  icon,
}: {
  label: string;
  tone?: Tone;
  icon?: IconName;
}) {
  const { colors } = useTheme();
  const { bg, fg } = toneColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: colors[bg] }]}>
      {icon ? <Icon name={icon} size={13} color={fg} /> : null}
      <AppText variant="tag" color={fg} numberOfLines={1} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  text: { includeFontPadding: false },
});
