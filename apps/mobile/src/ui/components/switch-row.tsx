import { Platform, StyleSheet, Switch, View } from 'react-native';

import { spacing, useTheme } from '../theme';
import { AppText } from './app-text';

export interface SwitchRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function SwitchRow({ label, description, value, onValueChange, disabled }: SwitchRowProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText variant="bodyStrong">{label}</AppText>
        {description ? (
          <AppText variant="caption" color="textMuted">
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor={colors.key}
        {...webOnly({ activeThumbColor: colors.onPrimary })}
      />
    </View>
  );
}

/**
 * The web's Switch colours its thumb with a prop of its own when on (teal unless told
 * otherwise); React Native's types do not know the prop, and a phone ignores it.
 */
function webOnly(props: { activeThumbColor: string }): object {
  return Platform.OS === 'web' ? props : {};
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 44 },
  text: { flex: 1, gap: 2 },
});
