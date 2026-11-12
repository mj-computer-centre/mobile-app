import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { spacing, useTheme } from '../theme';
import { AppText } from './app-text';
import { Icon } from './icon';

export interface ListRowProps {
  title: string;
  subtitle?: string | undefined;
  leading?: ReactNode;
  /** Extra controls (buttons, badges). Kept outside the tappable area: see below. */
  trailing?: ReactNode;
  onPress?: () => void;
  /** Shows a chevron when the row opens another screen. */
  navigates?: boolean;
  accessibilityHint?: string;
}

/**
 * Only the main area (leading, text, chevron) is pressable; `trailing` sits beside it. Nesting
 * buttons inside a pressable row is invalid HTML on the web admin and confuses screen readers,
 * which announce the whole row as one button.
 */
export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  navigates,
  accessibilityHint,
}: ListRowProps) {
  const { colors } = useTheme();
  const main = (
    <>
      {leading}
      <View style={styles.text}>
        <AppText variant="label" numberOfLines={2}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textMuted" numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {navigates ? <Icon name="chevron-right" color="textMuted" /> : null}
    </>
  );
  const mainStyle = [styles.main, trailing ? styles.mainBesideTrailing : null];

  return (
    <View style={styles.row}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
          accessibilityHint={accessibilityHint}
          onPress={onPress}
          style={({ pressed }) => [mainStyle, pressed && { backgroundColor: colors.surfaceMuted }]}>
          {main}
        </Pressable>
      ) : (
        <View style={mainStyle}>{main}</View>
      )}
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignSelf: 'stretch',
  },
  mainBesideTrailing: { paddingRight: spacing.sm },
  text: { flex: 1, gap: 2 },
  trailing: { paddingRight: spacing.sm },
});
