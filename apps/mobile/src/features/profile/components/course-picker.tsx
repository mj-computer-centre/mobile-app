import { Pressable, StyleSheet, View } from 'react-native';

import type { CourseOption } from '@/features/catalog';
import { AppText, radius, spacing, useTheme } from '@/ui';

export interface CoursePickerProps {
  options: CourseOption[];
  value: string;
  onChange: (courseId: string) => void;
}

/** Tappable chips: easier than a dropdown on a small phone. Tapping the chosen one clears it. */
export function CoursePicker({ options, value, onChange }: CoursePickerProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.title}
            onPress={() => onChange(selected ? '' : option.id)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.primary : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}>
            <AppText variant="label" color={selected ? 'onPrimary' : 'text'}>
              {option.title}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
});
