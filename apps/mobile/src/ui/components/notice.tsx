import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, spacing, useTheme } from '../theme';
import { AppText } from './app-text';
import { Icon, type IconName } from './icon';
import { toneColors, type Tone } from './icon-chip';

const defaultIcons: Record<Tone, IconName> = {
  primary: 'information-outline',
  accent: 'star-four-points-outline',
  success: 'check-circle-outline',
  warning: 'alert-outline',
  danger: 'alert-circle-outline',
  neutral: 'information-outline',
};

/** A message about the page it sits on: a warning, a confirmation, something to know first. */
export function Notice({
  tone = 'primary',
  title,
  children,
  icon,
  action,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  icon?: IconName;
  /** A button under the message, for the one thing the reader can do about it. */
  action?: ReactNode;
}) {
  const { colors } = useTheme();
  const { bg, fg } = toneColors[tone];
  return (
    <View style={[styles.notice, { backgroundColor: colors[bg] }]}>
      <Icon name={icon ?? defaultIcons[tone]} size={20} color={fg} />
      <View style={styles.body}>
        {title ? <AppText variant="bodyStrong">{title}</AppText> : null}
        {typeof children === 'string' ? <AppText>{children}</AppText> : children}
        {action ? <View style={styles.action}>{action}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    paddingRight: spacing.lg,
    borderRadius: radius.md,
  },
  body: { flex: 1, gap: 2 },
  action: { alignSelf: 'flex-start', marginTop: spacing.sm },
});
