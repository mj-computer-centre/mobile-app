import { StyleSheet, View } from 'react-native';

import type { CourseOption } from '@/features/catalog';
import { AppText, Key, keyDepth, radius, spacing } from '@/ui';

export interface CoursePickerProps {
  options: CourseOption[];
  value: string;
  onChange: (courseId: string) => void;
}

/**
 * One key per course: easier than a dropdown on a small phone. The chosen key stays down;
 * pressing it again lets go.
 */
export function CoursePicker({ options, value, onChange }: CoursePickerProps) {
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Key
            key={option.id}
            tone={selected ? 'primary' : 'neutral'}
            depth={keyDepth.sm}
            cornerRadius={radius.sm + 2}
            latched={selected}
            accessibilityRole="radio"
            accessibilityLabel={option.title}
            accessibilityState={{ selected, checked: selected }}
            onPress={() => onChange(selected ? '' : option.id)}
            faceStyle={styles.face}>
            <AppText variant="label" color={selected ? 'onPrimary' : 'text'}>
              {option.title}
            </AppText>
          </Key>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  face: { minHeight: 38, paddingHorizontal: spacing.md },
});
