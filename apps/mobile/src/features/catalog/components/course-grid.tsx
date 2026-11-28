import type { CourseSummary } from '@mcc/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, Skeleton, spacing, useLayout } from '@/ui';

import { CourseCard } from './course-card';

export interface CourseGridProps {
  courses: CourseSummary[];
  onOpen: (course: CourseSummary) => void;
  showDraftBadge?: boolean;
}

/** One column on a phone, two or three on a laptop, from the space the grid actually gets. */
function useColumns(): { columns: number; onLayout: (width: number) => void } {
  const { isWide } = useLayout();
  const [width, setWidth] = useState(0);
  const columns = width >= 880 ? 3 : width >= 540 ? 2 : isWide && width === 0 ? 3 : 1;
  return { columns, onLayout: setWidth };
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

/**
 * Course cards in as many columns as fit. The column count follows the space the grid gets
 * (the sidebar takes some of the window).
 */
export function CourseGrid({ courses, onOpen, showDraftBadge }: CourseGridProps) {
  const { columns, onLayout } = useColumns();

  return (
    <View style={styles.grid} onLayout={(event) => onLayout(event.nativeEvent.layout.width)}>
      {chunk(courses, columns).map((row) => (
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

/** Placeholders in the shape of the grid, shown while the course list loads. */
export function CourseGridSkeleton({ count = 3 }: { count?: number }) {
  const { columns, onLayout } = useColumns();
  const cards = Array.from({ length: count }, (_, index) => index);

  return (
    <View
      style={styles.grid}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading courses"
      onLayout={(event) => onLayout(event.nativeEvent.layout.width)}>
      {chunk(cards, columns).map((row) => (
        <View key={row.join()} style={styles.row}>
          {row.map((card) => (
            <View key={card} style={[styles.cell, styles.skeleton]}>
              <Skeleton height={undefined} rounded={radius.lg} style={styles.skeletonCover} />
              <Skeleton width="55%" height={18} />
              <Skeleton width="85%" height={13} />
            </View>
          ))}
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
  skeleton: { gap: spacing.sm },
  skeletonCover: { aspectRatio: 16 / 9 },
});
