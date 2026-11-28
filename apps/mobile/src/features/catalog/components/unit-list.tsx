import type { Lesson, Unit } from '@mcc/shared';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Divider, Icon, radius, spacing, useTheme } from '@/ui';

import { LessonRow } from './lesson-row';

export interface UnitListProps {
  units: Unit[];
  onOpenLesson: (lesson: Lesson, unit: Unit) => void;
  /** Units start closed except this one, so long courses stay easy to scan. */
  initiallyOpen?: number;
}

/** "2 videos · 1 PDF", or what to say when a unit is still empty. */
export function lessonCounts(lessons: readonly { kind: 'video' | 'pdf' }[]): string {
  const videos = lessons.filter((lesson) => lesson.kind === 'video').length;
  const pdfs = lessons.length - videos;
  return (
    [
      videos ? `${videos} video${videos === 1 ? '' : 's'}` : null,
      pdfs ? `${pdfs} PDF${pdfs === 1 ? '' : 's'}` : null,
    ]
      .filter(Boolean)
      .join(' · ') || 'Lessons coming soon'
  );
}

export function UnitList({ units, onOpenLesson, initiallyOpen = 0 }: UnitListProps) {
  return (
    <View style={styles.list}>
      {units.map((unit, index) => (
        <UnitBlock
          key={unit.sectionId}
          unit={unit}
          open={index === initiallyOpen}
          onOpenLesson={onOpenLesson}
        />
      ))}
    </View>
  );
}

function UnitBlock({
  unit,
  open,
  onOpenLesson,
}: {
  unit: Unit;
  open: boolean;
  onOpenLesson: UnitListProps['onOpenLesson'];
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(open);

  return (
    <View style={[styles.unit, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${unit.label}, ${lessonCounts(unit.lessons)}`}
        onPress={() => setExpanded((value) => !value)}
        android_ripple={{ color: colors.surfaceMuted }}
        style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="subheading">{unit.label}</AppText>
          <AppText variant="caption" color="textMuted">
            {lessonCounts(unit.lessons)}
          </AppText>
        </View>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} color="textMuted" />
      </Pressable>
      {expanded
        ? unit.lessons.map((lesson) => (
            <View key={lesson.id}>
              <Divider inset={0} />
              <LessonRow lesson={lesson} onPress={() => onOpenLesson(lesson, unit)} />
            </View>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  unit: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: 64,
  },
  headerText: { flex: 1, gap: 2 },
});
