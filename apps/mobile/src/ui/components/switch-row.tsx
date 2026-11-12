import { StyleSheet, Switch, View } from 'react-native';

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
        <AppText variant="label">{label}</AppText>
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: 2 },
});
