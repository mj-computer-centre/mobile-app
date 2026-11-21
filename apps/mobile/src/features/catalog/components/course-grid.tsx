import type { CourseSummary } from '@mcc/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing, useLayout } from '@/ui';

import { CourseCard } from './course-card';

export interface CourseGridProps {
  courses: CourseSummary[];
  onOpen: (course: CourseSummary) => void;
  showDraftBadge?: boolean;
}

/**
 * Course cards in as many columns as fit: one on a phone, two or three on a laptop. The column
 * count follows the space the grid actually gets (the sidebar takes some of the window).
 */
export function CourseGrid({ courses, onOpen, showDraftBadge }: CourseGridProps) {
  const { isWide } = useLayout();
  const [width, setWidth] = useState(0);
  const columns = width >= 880 ? 3 : width >= 540 ? 2 : isWide && width === 0 ? 3 : 1;
  const rows: CourseSummary[][] = [];
  for (let i = 0; i < courses.length; i += columns) rows.push(courses.slice(i, i + columns));

  return (
    <View style={styles.grid} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {rows.map((row) => (
        <View key={row.map((course) => course.id).join()} style={styles.row}>
          {row.map((course) => (
            <View key={course.id} style={styles.cell}>
              <CourseCard
                course={course}
                stretch
                showDraftBadge={showDraftBadge}
                onPress={() => onOpen(course)}
              />
            </View>
          ))}
          {/* Empty cells keep the last row's cards the same width as the rows above. */}
          {Array.from({ length: columns - row.length }, (_, index) => (
            <View key={`spacer-${index}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.lg },
  cell: { flex: 1, minWidth: 0 },
});
