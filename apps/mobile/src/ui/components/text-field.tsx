import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { radius, spacing, typography, useTheme } from '../theme';
import { AppText } from './app-text';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | undefined;
  hint?: string;
}

export function TextField({ label, error, hint, multiline, ...inputProps }: TextFieldProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...inputProps}
        style={[
          styles.input,
          typography.body,
          multiline && styles.multiline,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      />
      {error ? (
        <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="textMuted">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multiline: { minHeight: 110 },
});
